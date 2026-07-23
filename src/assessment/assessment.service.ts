import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Category } from './entities/category.entity';
import { Question } from './entities/question.entity';
import { Option } from './entities/option.entity';
import { OptionScore } from './entities/option-score.entity';
import { Participant } from './entities/participant.entity';
import { Assessment } from './entities/assessment.entity';
import { Answer } from './entities/answer.entity';
import { RegisterDto } from './dto/register.dto';
import { SubmitDto } from './dto/submit.dto';
import {
  ScoringQuestionInput,
  ScoringService,
} from './scoring.service';
import { DeviationDirection } from './entities/assessment.entity';
import { EmailService } from '../email/email.service';

const DEVIATION_LABEL: Record<DeviationDirection, string> = {
  aligned: 'Tus respuestas están alineadas con el rol declarado.',
  inferior:
    'Tus respuestas tienden hacia un rol de menor responsabilidad (hacia Empleado).',
  superior:
    'Tus respuestas tienden hacia un rol de mayor responsabilidad (hacia Director).',
};

const INTRO_TEXT =
  'Esta autoevaluación te presenta situaciones laborales reales. Elegí en cada ' +
  'caso la opción que mejor refleje cómo actuarías. Al finalizar vas a ver qué tan ' +
  'alineadas están tus respuestas con el rol que declaraste. No hay respuestas ' +
  'correctas o incorrectas: el objetivo es reflexionar sobre tu desempeño.';

@Injectable()
export class AssessmentService {
  constructor(
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
    @InjectRepository(Question)
    private readonly questions: Repository<Question>,
    @InjectRepository(OptionScore)
    private readonly optionScores: Repository<OptionScore>,
    @InjectRepository(Participant)
    private readonly participants: Repository<Participant>,
    @InjectRepository(Assessment)
    private readonly assessments: Repository<Assessment>,
    private readonly scoring: ScoringService,
    private readonly email: EmailService,
    private readonly dataSource: DataSource,
  ) {}

  /** Datos para arrancar el flujo: intro, roles y cuestionario (sin puntajes). */
  async bootstrap() {
    const [roles, categories] = await Promise.all([
      this.roles.find({ where: { isActive: true }, order: { level: 'ASC' } }),
      this.categories.find({
        where: { isActive: true },
        relations: { questions: { options: true } },
        order: { sortOrder: 'ASC' },
      }),
    ]);

    return {
      intro: INTRO_TEXT,
      roles: roles.map((r) => ({ id: r.id, key: r.key, name: r.name })),
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        questions: (c.questions ?? [])
          .filter((q) => q.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((q) => ({
            id: q.id,
            situation: q.situation,
            // Importante: nunca exponemos los puntajes al cliente.
            options: (q.options ?? [])
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((o) => ({ id: o.id, text: o.text })),
          })),
      })),
    };
  }

  /** Registra al participante y abre un intento en progreso. */
  async register(dto: RegisterDto): Promise<{ assessmentId: string }> {
    const role = await this.roles.findOne({
      where: { id: dto.declaredRoleId, isActive: true },
    });
    if (!role) throw new BadRequestException('Rol declarado inválido');

    const participant = await this.participants.save(
      this.participants.create({
        fullName: dto.fullName.trim(),
        email: dto.email.trim().toLowerCase(),
        declaredRoleId: role.id,
        wantsEmailResults: dto.wantsEmailResults ?? false,
      }),
    );

    const assessment = await this.assessments.save(
      this.assessments.create({
        participantId: participant.id,
        declaredRoleId: role.id,
        status: 'in_progress',
      }),
    );

    return { assessmentId: assessment.id };
  }

  /** Recibe todas las respuestas, calcula y persiste el resultado. */
  async submit(assessmentId: string, dto: SubmitDto) {
    const assessment = await this.assessments.findOne({
      where: { id: assessmentId },
      relations: { declaredRole: true },
    });
    if (!assessment) throw new NotFoundException('Intento no encontrado');
    if (assessment.status === 'completed') {
      throw new ConflictException('El intento ya fue completado');
    }

    // Una sola respuesta por pregunta.
    const byQuestion = new Map<number, number>();
    for (const a of dto.answers) byQuestion.set(a.questionId, a.optionId);

    const activeQuestions = await this.questions.find({
      where: { isActive: true, category: { isActive: true } },
      relations: { options: true, category: true },
    });

    if (byQuestion.size !== activeQuestions.length) {
      throw new BadRequestException(
        `Debés responder las ${activeQuestions.length} preguntas activas`,
      );
    }

    // Validar que cada opción elegida pertenezca a su pregunta.
    const optionIdsByQuestion = new Map<number, Set<number>>();
    const allOptionIds: number[] = [];
    for (const q of activeQuestions) {
      const set = new Set((q.options ?? []).map((o) => o.id));
      optionIdsByQuestion.set(q.id, set);
      allOptionIds.push(...set);
    }
    for (const q of activeQuestions) {
      const chosen = byQuestion.get(q.id);
      if (chosen === undefined) {
        throw new BadRequestException(`Falta responder la pregunta ${q.id}`);
      }
      if (!optionIdsByQuestion.get(q.id)!.has(chosen)) {
        throw new BadRequestException(
          `La opción ${chosen} no pertenece a la pregunta ${q.id}`,
        );
      }
    }

    // Puntajes de todas las opciones para el rol declarado + niveles de rol.
    const [scores, roles] = await Promise.all([
      this.optionScores.find({
        where: {
          optionId: In(allOptionIds),
          roleId: assessment.declaredRoleId,
        },
      }),
      this.roles.find(),
    ]);
    const scoreByOption = new Map(scores.map((s) => [s.optionId, s.score]));
    const levelByRole = new Map(roles.map((r) => [r.id, r.level]));

    const scoringInput: ScoringQuestionInput[] = activeQuestions.map((q) => ({
      questionId: q.id,
      categoryId: q.categoryId,
      chosenOptionId: byQuestion.get(q.id)!,
      options: (q.options ?? []).map((o) => ({
        optionId: o.id,
        scoreForDeclaredRole: Number(scoreByOption.get(o.id) ?? 0),
        alignedRoleLevel:
          o.alignedRoleId !== null
            ? (levelByRole.get(o.alignedRoleId) ?? null)
            : null,
      })),
    }));

    const result = this.scoring.compute(
      assessment.declaredRole.level,
      scoringInput,
    );

    // Persistir respuestas + resultado en una transacción.
    await this.dataSource.transaction(async (manager) => {
      const answerRepo = manager.getRepository(Answer);
      await answerRepo.delete({ assessmentId });
      await answerRepo.save(
        result.answers.map((a) =>
          answerRepo.create({
            assessmentId,
            questionId: a.questionId,
            optionId: a.optionId,
            scoreAwarded: a.scoreAwarded,
          }),
        ),
      );
      await manager.getRepository(Assessment).update(assessmentId, {
        status: 'completed',
        totalScore: result.totalScore,
        maxScore: result.maxScore,
        alignmentPct: result.alignmentPct,
        deviation: result.deviation,
        completedAt: new Date(),
      });
    });

    const summary = await this.getResult(assessmentId);

    // Envío del email de resultados si el usuario lo pidió (no bloquea el flujo).
    if (summary.participant.wantsEmailResults) {
      await this.email.sendResultEmail({
        to: summary.participant.email,
        fullName: summary.participant.fullName,
        roleName: summary.role.name,
        alignmentPct: summary.alignmentPct,
        deviationLabel: DEVIATION_LABEL[summary.deviation],
        categories: summary.categories.map((c) => ({
          name: c.name,
          alignmentPct: c.alignmentPct,
        })),
      });
    }

    return summary;
  }

  /** Resumen de resultados para la pantalla final y el email. */
  async getResult(assessmentId: string) {
    const assessment = await this.assessments.findOne({
      where: { id: assessmentId },
      relations: { declaredRole: true, participant: true },
    });
    if (!assessment) throw new NotFoundException('Intento no encontrado');
    if (assessment.status !== 'completed') {
      throw new ConflictException('El intento todavía no fue completado');
    }

    // Reconstruir el desglose por categoría desde las respuestas guardadas.
    const categories = await this.categories.find({
      where: { isActive: true },
      relations: { questions: { options: true } },
      order: { sortOrder: 'ASC' },
    });

    const [scores, answers] = await Promise.all([
      this.optionScores.find({
        where: { roleId: assessment.declaredRoleId },
      }),
      this.dataSource.getRepository(Answer).find({ where: { assessmentId } }),
    ]);
    const scoreByOption = new Map(scores.map((s) => [s.optionId, s.score]));
    const chosenByQuestion = new Map(
      answers.map((a) => [a.questionId, a]),
    );

    const categoryBreakdown = categories.map((c) => {
      let total = 0;
      let max = 0;
      for (const q of (c.questions ?? []).filter((x) => x.isActive)) {
        const answer = chosenByQuestion.get(q.id);
        if (answer) total += answer.scoreAwarded;
        max += (q.options ?? []).reduce(
          (m, o) => Math.max(m, scoreByOption.get(o.id) ?? 0),
          Number.NEGATIVE_INFINITY,
        );
      }
      const pct = max > 0 ? (total / max) * 100 : 0;
      return {
        id: c.id,
        name: c.name,
        alignmentPct: Math.round(pct * 100) / 100,
        band: this.scoring.bandFor(pct),
      };
    });

    return {
      assessmentId: assessment.id,
      participant: {
        fullName: assessment.participant.fullName,
        email: assessment.participant.email,
        wantsEmailResults: assessment.participant.wantsEmailResults,
      },
      role: {
        id: assessment.declaredRole.id,
        name: assessment.declaredRole.name,
      },
      alignmentPct: assessment.alignmentPct,
      band: this.scoring.bandFor(assessment.alignmentPct),
      deviation: assessment.deviation,
      deviationLabel: DEVIATION_LABEL[assessment.deviation],
      totalScore: assessment.totalScore,
      maxScore: assessment.maxScore,
      categories: categoryBreakdown,
    };
  }
}
