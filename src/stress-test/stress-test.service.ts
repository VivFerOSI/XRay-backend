import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StressTestSubmission } from './stress-test.entity';
import { SubmitStressTestDto } from './dto/submit-stress-test.dto';
import { computeResult } from './scoring';
import {
  ALL_QUESTIONS,
  NORTE_OPTIONS,
  NORTE_QUESTION,
  ORG_FIELDS,
  PILARES,
  SCALE,
} from './content';

@Injectable()
export class StressTestService {
  constructor(
    @InjectRepository(StressTestSubmission)
    private readonly repo: Repository<StressTestSubmission>,
  ) {}

  /** Contenido para armar el formulario (sin puntajes ni textos de devolución). */
  getContent() {
    return {
      title: 'Stress Test de Robustez y Crecimiento del Emprendimiento',
      orgFields: ORG_FIELDS,
      scale: SCALE,
      pilares: PILARES.map((p) => ({
        key: p.key,
        name: p.name,
        questions: p.questions,
      })),
      norte: {
        question: NORTE_QUESTION,
        options: NORTE_OPTIONS.map((o) => ({ key: o.key, label: o.label })),
      },
    };
  }

  /** Valida, calcula el resultado, guarda el envío y devuelve la devolución. */
  async submit(dto: SubmitStressTestDto) {
    if (!dto.consent) {
      throw new BadRequestException(
        'Se requiere el consentimiento para el tratamiento de los datos de contacto.',
      );
    }

    // Mapa questionId → valor, validando cobertura de las 25 preguntas.
    const answers: Record<number, number> = {};
    for (const a of dto.answers) {
      answers[a.questionId] = a.value;
    }
    const expectedIds = ALL_QUESTIONS.map((q) => q.id);
    const missing = expectedIds.filter((id) => answers[id] === undefined);
    if (missing.length > 0) {
      throw new BadRequestException(
        `Faltan respuestas para las preguntas: ${missing.join(', ')}.`,
      );
    }

    const result = computeResult(answers, dto.norte);

    const submission = this.repo.create({
      nombreEmprendimiento: dto.nombreEmprendimiento,
      sector: dto.sector,
      antiguedad: dto.antiguedad,
      tamanoEquipo: dto.tamanoEquipo,
      nombreContacto: dto.nombreContacto,
      email: dto.email,
      telefono: dto.telefono ?? null,
      consent: dto.consent,
      norte: dto.norte,
      answers: Object.fromEntries(
        Object.entries(answers).map(([k, v]) => [String(k), v]),
      ),
      pilarScores: Object.fromEntries(result.pilares.map((p) => [p.key, p.score])),
      totalScore: result.total,
      globalLevel: result.global.level,
    });
    const saved = await this.repo.save(submission);

    return { id: saved.id, result };
  }
}
