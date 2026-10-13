import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { randomBytes } from 'node:crypto';
import { Evaluacion360, Evaluador360 } from './evaluacion360.entity';
import { StressTestSubmission } from '../stress-test/stress-test.entity';
import { AssessmentsService } from '../stress-test/assessments.service';
import { allQuestions, listoPara360 } from '../stress-test/types';
import { compararCon360 } from './comparativo';
import { EmailService } from '../email/email.service';

/** Días de plazo si el cuestionario no define otro. */
const DIAS_POR_DEFECTO = 7;
/** Invitados máximos si el cuestionario no define otro. */
const MAX_EVALUADORES = 3;
/** Días sin responder antes de mandar un recordatorio. */
const DIAS_PARA_RECORDAR = 3;
/** Tope de recordatorios por evaluador. */
const MAX_RECORDATORIOS = 2;

@Injectable()
export class Evaluacion360Service {
  private readonly logger = new Logger(Evaluacion360Service.name);

  constructor(
    @InjectRepository(Evaluacion360)
    private readonly rondas: Repository<Evaluacion360>,
    @InjectRepository(Evaluador360)
    private readonly evaluadores: Repository<Evaluador360>,
    @InjectRepository(StressTestSubmission)
    private readonly submissions: Repository<StressTestSubmission>,
    private readonly assessments: AssessmentsService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

  private get publicUrl(): string {
    return this.config
      .get<string>('PUBLIC_APP_URL', 'https://x-ray.ar')
      .replace(/\/+$/, '');
  }

  /**
   * Abre una ronda e invita a los evaluadores.
   *
   * Una autoevaluación puede tener una sola ronda: permitir varias dejaría dos
   * informes comparativos distintos sobre la misma base y no hay forma de
   * decidir cuál vale.
   */
  async invitar(
    submissionId: string,
    invitados: { nombre: string; email: string }[],
  ) {
    const submission = await this.submissions.findOne({
      where: { id: submissionId },
    });
    if (!submission) {
      throw new NotFoundException('No encontramos esa autoevaluación.');
    }

    const existente = await this.rondas.findOne({ where: { submissionId } });
    if (existente) {
      throw new ConflictException(
        'Esta autoevaluación ya tiene una evaluación 360° en curso.',
      );
    }

    const assessment = await this.assessments.obtener(submission.assessmentKey);
    const listo = listoPara360(assessment);
    if (!listo.ok) {
      throw new BadRequestException(listo.motivo);
    }

    const max = assessment.maxEvaluadores ?? MAX_EVALUADORES;
    if (invitados.length === 0) {
      throw new BadRequestException('Indicá al menos una persona.');
    }
    if (invitados.length > max) {
      throw new BadRequestException(`Podés invitar hasta ${max} personas.`);
    }

    const emails = invitados.map((i) => i.email.trim().toLowerCase());
    if (new Set(emails).size !== emails.length) {
      throw new BadRequestException('Hay direcciones repetidas en la lista.');
    }
    if (emails.includes(submission.email.trim().toLowerCase())) {
      throw new BadRequestException(
        'No podés invitarte a vos mismo: la idea es contrastar tu mirada con la de otros.',
      );
    }

    const dias = assessment.dias360 ?? DIAS_POR_DEFECTO;
    const venceEl = new Date();
    venceEl.setDate(venceEl.getDate() + dias);

    const ronda = await this.rondas.save(
      this.rondas.create({
        submissionId,
        assessmentKey: submission.assessmentKey,
        venceEl,
        estado: 'abierta',
        evaluadores: invitados.map((i) =>
          this.evaluadores.create({
            nombre: i.nombre.trim(),
            email: i.email.trim(),
            // 32 bytes al azar: el enlace es la credencial, no puede ser
            // adivinable ni derivarse de la ronda o del email.
            token: randomBytes(32).toString('base64url'),
          }),
        ),
      }),
    );

    const completa = await this.rondas.findOne({
      where: { id: ronda.id },
      relations: ['evaluadores'],
    });

    await Promise.all(
      (completa?.evaluadores ?? []).map((ev) =>
        this.email.sendInvitacion360({
          to: ev.email,
          nombreEvaluador: ev.nombre,
          nombreEvaluado: submission.nombreContacto,
          titulo: assessment.title,
          url: `${this.publicUrl}/evaluacion/${ev.token}`,
          venceEl,
        }),
      ),
    );

    return {
      id: ronda.id,
      venceEl,
      invitados: (completa?.evaluadores ?? []).map((e) => ({
        nombre: e.nombre,
        email: e.email,
        estado: e.estado,
      })),
    };
  }

  /** Cuestionario que ve un evaluador al abrir su enlace. */
  async contenidoPorToken(token: string) {
    const ev = await this.evaluadores.findOne({
      where: { token },
      relations: ['ronda', 'ronda.submission'],
    });
    if (!ev) throw new NotFoundException('Este enlace no es válido.');

    const assessment = await this.assessments.obtener(ev.ronda.assessmentKey);

    return {
      estado: ev.estado,
      vencida: ev.ronda.estado === 'cerrada' || ev.ronda.venceEl < new Date(),
      venceEl: ev.ronda.venceEl,
      nombreEvaluador: ev.nombre,
      nombreEvaluado: ev.ronda.submission.nombreContacto,
      title: assessment.title,
      scale: assessment.scale,
      pilares: assessment.pilares.map((p) => ({
        key: p.key,
        name: p.name,
        // El evaluador responde sobre otra persona: van los textos en tercera.
        questions: p.questions.map((q) => ({
          id: q.id,
          text: q.textoTercera ?? q.text,
        })),
      })),
    };
  }

  /** Guarda las respuestas de un evaluador. */
  async responder(token: string, respuestas: { questionId: number; value: number }[]) {
    const ev = await this.evaluadores.findOne({
      where: { token },
      relations: ['ronda'],
    });
    if (!ev) throw new NotFoundException('Este enlace no es válido.');
    if (ev.estado === 'respondido') {
      throw new ConflictException('Ya respondiste esta evaluación. ¡Gracias!');
    }
    if (ev.ronda.estado === 'cerrada' || ev.ronda.venceEl < new Date()) {
      throw new BadRequestException(
        'El plazo para responder venció. Hablalo con quien te invitó.',
      );
    }

    const assessment = await this.assessments.obtener(ev.ronda.assessmentKey);
    const esperados = allQuestions(assessment).map((q) => q.id);
    const answers: Record<string, number> = {};
    for (const r of respuestas) answers[String(r.questionId)] = r.value;

    const faltan = esperados.filter((id) => answers[String(id)] === undefined);
    if (faltan.length > 0) {
      throw new BadRequestException(
        `Faltan respuestas para las preguntas: ${faltan.join(', ')}.`,
      );
    }

    ev.answers = answers;
    ev.estado = 'respondido';
    ev.respondioEl = new Date();
    await this.evaluadores.save(ev);

    // Si ya respondieron todos, no tiene sentido esperar al vencimiento.
    const pendientes = await this.evaluadores.count({
      where: { rondaId: ev.rondaId, estado: 'pendiente' },
    });
    if (pendientes === 0) {
      await this.cerrarYEnviar(ev.rondaId);
    }

    return { ok: true };
  }

  /**
   * Estado de la ronda de una autoevaluación.
   *
   * Informa también si el 360° está disponible para ese cuestionario, para que
   * el sitio no ofrezca invitar donde el envío va a fallar.
   */
  async estadoPorSubmission(submissionId: string) {
    const submission = await this.submissions.findOne({
      where: { id: submissionId },
    });
    if (!submission) {
      throw new NotFoundException('No encontramos esa autoevaluación.');
    }
    const assessment = await this.assessments.obtener(submission.assessmentKey);
    const disponible = listoPara360(assessment).ok;

    const ronda = await this.rondas.findOne({
      where: { submissionId },
      relations: ['evaluadores'],
    });
    if (!ronda) return { existe: false as const, disponible };

    return {
      existe: true as const,
      disponible,
      estado: ronda.estado,
      venceEl: ronda.venceEl,
      informeEnviadoEl: ronda.informeEnviadoEl,
      evaluadores: ronda.evaluadores.map((e) => ({
        nombre: e.nombre,
        email: e.email,
        estado: e.estado,
        respondioEl: e.respondioEl,
      })),
    };
  }

  /** Informe comparativo de una ronda cerrada. */
  async comparativo(submissionId: string) {
    const ronda = await this.rondas.findOne({
      where: { submissionId },
      relations: ['evaluadores', 'submission'],
    });
    if (!ronda) throw new NotFoundException('No hay evaluación 360° para este informe.');

    const respondidos = ronda.evaluadores.filter((e) => e.estado === 'respondido');
    if (respondidos.length === 0) {
      throw new BadRequestException('Todavía no respondió ninguna de las personas invitadas.');
    }

    const assessment = await this.assessments.obtener(ronda.assessmentKey);
    const answersAuto: Record<number, number> = {};
    for (const [k, v] of Object.entries(ronda.submission.answers)) {
      answersAuto[Number(k)] = v;
    }
    const terceros = respondidos.map((e) => {
      const a: Record<number, number> = {};
      for (const [k, v] of Object.entries(e.answers ?? {})) a[Number(k)] = v;
      return a;
    });

    return {
      venceEl: ronda.venceEl,
      estado: ronda.estado,
      invitados: ronda.evaluadores.length,
      comparativo: compararCon360(
        assessment,
        answersAuto,
        ronda.submission.norte,
        terceros,
      ),
    };
  }

  /** Cierra la ronda y manda el informe al evaluado. */
  private async cerrarYEnviar(rondaId: string): Promise<boolean> {
    const ronda = await this.rondas.findOne({
      where: { id: rondaId },
      relations: ['evaluadores', 'submission'],
    });
    if (!ronda || ronda.estado === 'cerrada') return false;

    ronda.estado = 'cerrada';
    const respondidos = ronda.evaluadores.filter((e) => e.estado === 'respondido');

    // Sin respuestas no hay nada que comparar: se cierra la ronda y se avisa,
    // pero no se manda un informe vacío.
    if (respondidos.length === 0) {
      await this.rondas.save(ronda);
      this.logger.warn(`Ronda ${rondaId} cerrada sin respuestas.`);
      await this.email.sendSin360({
        to: ronda.submission.email,
        nombreContacto: ronda.submission.nombreContacto,
      });
      return true;
    }

    const datos = await this.comparativo(ronda.submissionId);
    const enviado = await this.email.sendComparativo360({
      to: ronda.submission.email,
      nombreContacto: ronda.submission.nombreContacto,
      comparativo: datos.comparativo,
      reportUrl: `${this.publicUrl}/autoevaluacion/resultado/${ronda.submissionId}`,
    });

    ronda.informeEnviadoEl = enviado ? new Date() : null;
    await this.rondas.save(ronda);
    return true;
  }

  /**
   * Tarea periódica: manda recordatorios y cierra las rondas vencidas.
   *
   * La dispara Cloud Scheduler, no un cron del proceso: Cloud Run escala a
   * cero y un temporizador interno no correría cuando no hay tráfico.
   */
  async procesarVencimientos() {
    const ahora = new Date();
    const resumen = { recordatorios: 0, cerradas: 0 };

    // 1) Recordatorios a quienes todavía no respondieron.
    const limite = new Date();
    limite.setDate(limite.getDate() - DIAS_PARA_RECORDAR);

    const pendientes = await this.evaluadores.find({
      where: { estado: 'pendiente' },
      relations: ['ronda', 'ronda.submission'],
    });

    for (const ev of pendientes) {
      if (ev.ronda.estado === 'cerrada' || ev.ronda.venceEl < ahora) continue;
      if (ev.recordatorios >= MAX_RECORDATORIOS) continue;
      const referencia = ev.ultimoRecordatorio ?? ev.createdAt;
      if (referencia > limite) continue;

      const assessment = await this.assessments.obtener(ev.ronda.assessmentKey);
      const ok = await this.email.sendRecordatorio360({
        to: ev.email,
        nombreEvaluador: ev.nombre,
        nombreEvaluado: ev.ronda.submission.nombreContacto,
        titulo: assessment.title,
        url: `${this.publicUrl}/evaluacion/${ev.token}`,
        venceEl: ev.ronda.venceEl,
      });
      if (ok) {
        ev.recordatorios += 1;
        ev.ultimoRecordatorio = ahora;
        await this.evaluadores.save(ev);
        resumen.recordatorios++;
      }
    }

    // 2) Cerrar las rondas cuyo plazo venció.
    const vencidas = await this.rondas.find({
      where: { estado: 'abierta', venceEl: LessThanOrEqual(ahora) },
    });
    for (const r of vencidas) {
      if (await this.cerrarYEnviar(r.id)) resumen.cerradas++;
    }

    this.logger.log(
      `360°: ${resumen.recordatorios} recordatorios, ${resumen.cerradas} rondas cerradas.`,
    );
    return resumen;
  }
}
