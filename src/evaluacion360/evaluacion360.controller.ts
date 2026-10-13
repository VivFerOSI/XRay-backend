import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { Evaluacion360Service } from './evaluacion360.service';
import { InvitarDto, ResponderDto } from './dto/evaluacion360.dto';

@Controller()
export class Evaluacion360Controller {
  constructor(
    private readonly service: Evaluacion360Service,
    private readonly config: ConfigService,
  ) {}

  // ── Para la persona evaluada ──

  /** Invita evaluadores a partir de una autoevaluación ya enviada. */
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('evaluacion-360/:submissionId/invitar')
  invitar(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body() dto: InvitarDto,
  ) {
    return this.service.invitar(submissionId, dto.evaluadores);
  }

  /** Estado de la ronda: quién respondió y cuánto falta. */
  @Get('evaluacion-360/:submissionId')
  estado(@Param('submissionId', ParseUUIDPipe) submissionId: string) {
    return this.service.estadoPorSubmission(submissionId);
  }

  /** Informe comparativo, cuando ya hay respuestas. */
  @Get('evaluacion-360/:submissionId/comparativo')
  comparativo(@Param('submissionId', ParseUUIDPipe) submissionId: string) {
    return this.service.comparativo(submissionId);
  }

  // ── Para la persona que evalúa ──

  /** Cuestionario que abre el evaluador con su enlace. */
  @Get('evaluacion/:token')
  contenido(@Param('token') token: string) {
    return this.service.contenidoPorToken(token);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('evaluacion/:token')
  responder(@Param('token') token: string, @Body() dto: ResponderDto) {
    return this.service.responder(token, dto.answers);
  }

  // ── Tarea programada ──

  /**
   * Manda recordatorios y cierra las rondas vencidas.
   *
   * Lo invoca Cloud Scheduler una vez por día: Cloud Run escala a cero y un
   * temporizador dentro del proceso no correría sin tráfico. Se protege con
   * una clave compartida en la cabecera porque la ruta es pública.
   */
  @Post('tareas/evaluacion-360')
  async procesar(@Headers('x-tarea-clave') clave?: string) {
    const esperada = this.config.get<string>('TAREAS_CLAVE');
    if (!esperada || clave !== esperada) {
      throw new ForbiddenException();
    }
    return this.service.procesarVencimientos();
  }
}
