import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StressTestSubmission } from '../stress-test/stress-test.entity';
import { AssessmentsService } from '../stress-test/assessments.service';
import { computeResult } from '../stress-test/scoring';
import { Evaluacion360 } from '../evaluacion360/evaluacion360.entity';
import { Evaluacion360Service } from '../evaluacion360/evaluacion360.service';
import { verifyPassword } from './password';

export interface FiltrosSubmissions {
  assessmentKey?: string;
  desde?: string;
  hasta?: string;
  pagina?: number;
  porPagina?: number;
}

export interface FiltrosRondas360 {
  assessmentKey?: string;
  estado?: string;
  pagina?: number;
  porPagina?: number;
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    @InjectRepository(StressTestSubmission)
    private readonly submissions: Repository<StressTestSubmission>,
    @InjectRepository(Evaluacion360)
    private readonly rondas: Repository<Evaluacion360>,
    private readonly assessments: AssessmentsService,
    private readonly evaluacion360: Evaluacion360Service,
  ) {}

  /**
   * Valida las credenciales del panel y emite el token.
   *
   * El usuario y el hash de la contraseña viven en variables de entorno: hay
   * un solo administrador y agregar una tabla de usuarios para eso sería
   * sobredimensionado. Cuando haga falta más de uno, se migra.
   */
  async login(email: string, password: string): Promise<{ accessToken: string }> {
    const esperadoEmail = this.config.get<string>('ADMIN_EMAIL');
    const esperadoHash = this.config.get<string>('ADMIN_PASSWORD_HASH');

    if (!esperadoEmail || !esperadoHash) {
      this.logger.error(
        'Faltan ADMIN_EMAIL o ADMIN_PASSWORD_HASH: el panel queda inaccesible.',
      );
      throw new UnauthorizedException('El panel no está configurado.');
    }

    const emailOk = email.trim().toLowerCase() === esperadoEmail.toLowerCase();
    // Se verifica la contraseña aunque el email no coincida, para no revelar
    // por el tiempo de respuesta si el usuario existe.
    const passOk = await verifyPassword(password, esperadoHash);

    if (!emailOk || !passOk) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos.');
    }
    return {
      accessToken: await this.jwt.signAsync({ sub: esperadoEmail, rol: 'admin' }),
    };
  }

  /** Envíos recibidos, del más reciente al más viejo. */
  async listarSubmissions(f: FiltrosSubmissions) {
    const pagina = Math.max(1, f.pagina ?? 1);
    const porPagina = Math.min(100, Math.max(1, f.porPagina ?? 20));

    const qb = this.submissions
      .createQueryBuilder('s')
      .orderBy('s.createdAt', 'DESC')
      .skip((pagina - 1) * porPagina)
      .take(porPagina);

    if (f.assessmentKey) {
      qb.andWhere('s.assessmentKey = :key', { key: f.assessmentKey });
    }
    if (f.desde) qb.andWhere('s.createdAt >= :desde', { desde: f.desde });
    if (f.hasta) qb.andWhere('s.createdAt <= :hasta', { hasta: f.hasta });

    const [filas, total] = await qb.getManyAndCount();
    return {
      total,
      pagina,
      porPagina,
      paginas: Math.ceil(total / porPagina),
      items: filas.map((s) => ({
        id: s.id,
        createdAt: s.createdAt,
        assessmentKey: s.assessmentKey,
        nombreContacto: s.nombreContacto,
        email: s.email,
        telefono: s.telefono,
        nombreEmprendimiento: s.nombreEmprendimiento,
        sector: s.sector,
        antiguedad: s.antiguedad,
        tamanoEquipo: s.tamanoEquipo,
        norte: s.norte,
        totalScore: s.totalScore,
        globalLevel: s.globalLevel,
        pilarScores: s.pilarScores,
      })),
    };
  }

  /**
   * Un envío con todo: datos de contacto, respuesta de cada afirmación y la
   * devolución que vio la persona.
   *
   * Incluye el historial de esa misma persona (por email), que es lo que
   * permite ver la evolución entre evaluaciones sucesivas.
   */
  async detalleSubmission(id: string) {
    const s = await this.submissions.findOne({ where: { id } });
    if (!s) throw new NotFoundException('No encontramos ese resultado.');

    const assessment = await this.assessments.obtener(s.assessmentKey);

    const answers: Record<number, number> = {};
    for (const [k, v] of Object.entries(s.answers)) answers[Number(k)] = v;
    const result = computeResult(assessment, answers, s.norte);

    // Respuestas en el orden del cuestionario, con el texto de cada afirmación.
    const respuestas = assessment.pilares.flatMap((pilar) =>
      pilar.questions.map((q) => ({
        id: q.id,
        pilar: pilar.name,
        texto: q.text,
        valor: answers[q.id] ?? null,
        reverse: q.reverse ?? false,
      })),
    );

    const historial = await this.submissions.find({
      where: { email: s.email },
      order: { createdAt: 'DESC' },
      select: ['id', 'createdAt', 'assessmentKey', 'totalScore', 'globalLevel'],
    });

    // Para enlazar con el comparativo cuando esta persona invitó a su equipo.
    const tiene360 = (await this.rondas.count({ where: { submissionId: id } })) > 0;

    return {
      id: s.id,
      createdAt: s.createdAt,
      assessmentKey: s.assessmentKey,
      contacto: {
        nombre: s.nombreContacto,
        email: s.email,
        telefono: s.telefono,
      },
      organizacion: {
        nombre: s.nombreEmprendimiento,
        sector: s.sector,
        antiguedad: s.antiguedad,
        tamanoEquipo: s.tamanoEquipo,
      },
      norte: s.norte,
      norteLabel:
        assessment.norteOptions.find((o) => o.key === s.norte)?.label ?? s.norte,
      escala: assessment.scale,
      respuestas,
      result,
      tiene360,
      historial: historial.map((h) => ({
        id: h.id,
        createdAt: h.createdAt,
        assessmentKey: h.assessmentKey,
        totalScore: h.totalScore,
        globalLevel: h.globalLevel,
        esActual: h.id === s.id,
      })),
    };
  }

  // ── Evaluaciones 360° ──

  /**
   * Rondas de 360° con su avance, de la más reciente a la más vieja.
   *
   * Se lista por ronda y no por autoevaluación porque lo que interesa seguir
   * acá es quién invitó, cuántos respondieron y cuánto falta para que venza.
   */
  async listarRondas360(f: FiltrosRondas360) {
    const pagina = Math.max(1, f.pagina ?? 1);
    const porPagina = Math.min(100, Math.max(1, f.porPagina ?? 20));

    const qb = this.rondas
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.submission', 's')
      .leftJoinAndSelect('r.evaluadores', 'e')
      .orderBy('r.createdAt', 'DESC')
      .skip((pagina - 1) * porPagina)
      .take(porPagina);

    if (f.assessmentKey) {
      qb.andWhere('r.assessmentKey = :key', { key: f.assessmentKey });
    }
    if (f.estado) qb.andWhere('r.estado = :estado', { estado: f.estado });

    const [filas, total] = await qb.getManyAndCount();

    return {
      total,
      pagina,
      porPagina,
      paginas: Math.ceil(total / porPagina),
      items: filas.map((r) => ({
        submissionId: r.submissionId,
        createdAt: r.createdAt,
        assessmentKey: r.assessmentKey,
        estado: r.estado,
        venceEl: r.venceEl,
        informeEnviadoEl: r.informeEnviadoEl,
        invitados: r.evaluadores.length,
        respondieron: r.evaluadores.filter((e) => e.estado === 'respondido')
          .length,
        contacto: {
          nombre: r.submission?.nombreContacto ?? '',
          email: r.submission?.email ?? '',
        },
        nombreEmprendimiento: r.submission?.nombreEmprendimiento ?? '',
        totalScore: r.submission?.totalScore ?? null,
      })),
    };
  }

  /**
   * Comparativo de una ronda: la autoevaluación contra el promedio de los
   * evaluadores, pilar por pilar.
   *
   * Se identifica por `submissionId` y no por el id de la ronda porque hay una
   * sola ronda por autoevaluación, y así el panel enlaza el resultado con su
   * 360° usando el mismo id.
   *
   * Muestra quién respondió y quién no, pero **no las respuestas de cada
   * evaluador**: a los invitados se les promete que sólo se ve el promedio.
   */
  async detalleRonda360(submissionId: string) {
    const ronda = await this.rondas.findOne({
      where: { submissionId },
      relations: ['evaluadores', 'submission'],
    });
    if (!ronda) throw new NotFoundException('No hay evaluación 360° para este resultado.');

    const respondieron = ronda.evaluadores.filter(
      (e) => e.estado === 'respondido',
    ).length;

    const base = {
      submissionId: ronda.submissionId,
      assessmentKey: ronda.assessmentKey,
      createdAt: ronda.createdAt,
      estado: ronda.estado,
      venceEl: ronda.venceEl,
      informeEnviadoEl: ronda.informeEnviadoEl,
      contacto: {
        nombre: ronda.submission?.nombreContacto ?? '',
        email: ronda.submission?.email ?? '',
      },
      nombreEmprendimiento: ronda.submission?.nombreEmprendimiento ?? '',
      evaluadores: ronda.evaluadores.map((e) => ({
        nombre: e.nombre,
        email: e.email,
        estado: e.estado,
        respondioEl: e.respondioEl,
        recordatorios: e.recordatorios,
      })),
    };

    // Sin respuestas no hay nada que comparar: se devuelve la ronda igual, con
    // el comparativo en null, para que el panel muestre el avance.
    if (respondieron === 0) return { ...base, comparativo: null };

    const { comparativo } = await this.evaluacion360.comparativo(submissionId);
    return { ...base, comparativo };
  }

  /** Mismos datos que el listado, en CSV, sin paginar. */
  async exportarCsv(f: FiltrosSubmissions): Promise<string> {
    const qb = this.submissions
      .createQueryBuilder('s')
      .orderBy('s.createdAt', 'DESC');
    if (f.assessmentKey) {
      qb.andWhere('s.assessmentKey = :key', { key: f.assessmentKey });
    }
    if (f.desde) qb.andWhere('s.createdAt >= :desde', { desde: f.desde });
    if (f.hasta) qb.andWhere('s.createdAt <= :hasta', { hasta: f.hasta });
    const filas = await qb.getMany();

    // Los pilares varían según el cuestionario: se arma la cabecera con la
    // unión de todos los que aparezcan en el resultado.
    const pilares = [
      ...new Set(filas.flatMap((s) => Object.keys(s.pilarScores ?? {}))),
    ];

    const cabecera = [
      'Fecha',
      'Cuestionario',
      'Nombre',
      'Email',
      'Teléfono',
      'Organización',
      'Sector',
      'Antigüedad',
      'Equipo',
      'Norte',
      'Puntaje',
      'Nivel',
      ...pilares,
    ];

    const lineas = filas.map((s) =>
      [
        new Date(s.createdAt).toLocaleString('es-AR', {
          timeZone: 'America/Argentina/Buenos_Aires',
        }),
        s.assessmentKey,
        s.nombreContacto,
        s.email,
        s.telefono ?? '',
        s.nombreEmprendimiento,
        s.sector,
        s.antiguedad,
        s.tamanoEquipo,
        s.norte,
        s.totalScore,
        s.globalLevel,
        ...pilares.map((p) => s.pilarScores?.[p] ?? ''),
      ].map(celdaCsv),
    );

    // BOM para que Excel en Windows reconozca el UTF-8 y no rompa los acentos.
    return (
      '﻿' + [cabecera.map(celdaCsv), ...lineas].map((l) => l.join(';')).join('\r\n')
    );
  }
}

/** Escapa una celda: separador, comillas y saltos de línea. */
function celdaCsv(valor: unknown): string {
  const texto = String(valor ?? '');
  return /[";\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}
