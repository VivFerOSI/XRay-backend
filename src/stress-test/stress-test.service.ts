import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StressTestSubmission } from './stress-test.entity';
import { SubmitStressTestDto } from './dto/submit-stress-test.dto';
import { computeResult, StressResult } from './scoring';
import { EmailService } from '../email/email.service';
import { buildStressTestPdf } from '../pdf/stress-test-pdf';
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
  private readonly logger = new Logger(StressTestService.name);

  constructor(
    @InjectRepository(StressTestSubmission)
    private readonly repo: Repository<StressTestSubmission>,
    private readonly email: EmailService,
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

  /**
   * Recupera un informe ya enviado, para el enlace permanente que va en el
   * correo (`/autoevaluacion/resultado/:id`). El resultado se recalcula desde
   * las respuestas guardadas, así una corrección de textos o de bandas en
   * `content.ts` se refleja también en los informes viejos.
   *
   * Solo devuelve lo necesario para mostrar la devolución: nada de email ni
   * teléfono, porque el enlace es público para quien tenga el UUID.
   */
  async getSubmission(id: string) {
    const submission = await this.repo.findOne({ where: { id } });
    if (!submission) {
      throw new NotFoundException('No encontramos ese informe.');
    }

    const answers: Record<number, number> = {};
    for (const [key, value] of Object.entries(submission.answers)) {
      answers[Number(key)] = value;
    }

    return {
      id: submission.id,
      nombreEmprendimiento: submission.nombreEmprendimiento,
      nombreContacto: submission.nombreContacto,
      createdAt: submission.createdAt,
      result: computeResult(answers, submission.norte),
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

    await this.notify(saved, result);

    return { id: saved.id, result };
  }

  /**
   * Envía la devolución al participante y el aviso interno del lead.
   *
   * Se espera (await) a propósito: en Cloud Run la CPU se reduce casi a cero
   * cuando la respuesta ya salió, así que un envío "fire and forget" podría
   * no llegar a ejecutarse. EmailService nunca lanza: si el correo falla, se
   * loguea y el usuario recibe igual su resultado en pantalla.
   */
  private async notify(
    saved: StressTestSubmission,
    result: StressResult,
  ): Promise<void> {
    const norteLabel =
      NORTE_OPTIONS.find((o) => o.key === saved.norte)?.label ?? saved.norte;

    // El informe adjunto va en ambos correos. Si la generación falla, se
    // manda igual el correo sin adjunto: mejor eso que perder el aviso.
    let pdf: Buffer | undefined;
    try {
      pdf = await buildStressTestPdf({
        nombreEmprendimiento: saved.nombreEmprendimiento,
        nombreContacto: saved.nombreContacto,
        result,
        fecha: saved.createdAt,
      });
    } catch (err) {
      this.logger.error(
        `No se pudo generar el PDF de ${saved.id}: ${(err as Error).message}`,
      );
    }
    const pdfName = `Informe X-Ray - ${saved.nombreEmprendimiento}.pdf`.replace(
      /[\/:*?"<>|]/g,
      '',
    );

    await Promise.all([
      this.email.sendStressTestResult({
        to: saved.email,
        submissionId: saved.id,
        nombreContacto: saved.nombreContacto,
        nombreEmprendimiento: saved.nombreEmprendimiento,
        result,
        pdf,
        pdfName,
      }),
      this.email.sendStressTestLead({
        submissionId: saved.id,
        nombreEmprendimiento: saved.nombreEmprendimiento,
        sector: saved.sector,
        antiguedad: saved.antiguedad,
        tamanoEquipo: saved.tamanoEquipo,
        nombreContacto: saved.nombreContacto,
        email: saved.email,
        telefono: saved.telefono,
        norteLabel,
        result,
        pdf,
        pdfName,
      }),
    ]);
  }
}
