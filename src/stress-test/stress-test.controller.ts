import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { StressTestService } from './stress-test.service';
import { SubmitStressTestDto } from './dto/submit-stress-test.dto';
import { AssessmentsService } from './assessments.service';

/**
 * Las rutas sin `:key` responden el cuestionario por defecto
 * ('emprendimiento'). Existen porque el frontend publicado las usa: cambiarlas
 * romperia el sitio en produccion hasta el siguiente deploy del frontend.
 */
@Controller('stress-test')
export class StressTestController {
  constructor(
    private readonly service: StressTestService,
    private readonly assessments: AssessmentsService,
  ) {}

  /** Cuestionarios disponibles. */
  @Get()
  async list() {
    const todos = await this.assessments.listar();
    return todos.map((a) => ({
      key: a.key,
      title: a.title,
      shortName: a.shortName,
      // Lo que el sitio necesita para ofrecerlo sin tener los textos escritos
      // en el código del frontend.
      nombrePublico: a.nombrePublico ?? a.title,
      subtitulo: a.subtitulo,
      orientadoA: a.orientadoA,
      grupo: a.grupo,
    }));
  }

  /** Contenido del formulario del cuestionario por defecto. */
  @Get('content')
  content() {
    return this.service.getContent();
  }

  /**
   * Envía las respuestas, calcula y guarda el resultado, devuelve la devolución.
   * Límite estricto: máx. 5 envíos por minuto por IP (anti-spam del lead).
   */
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('submit')
  submit(@Body() dto: SubmitStressTestDto) {
    return this.service.submit(dto);
  }

  /**
   * Informe ya enviado, para el enlace permanente del correo. El UUID actúa
   * como credencial (no es adivinable) y la respuesta no incluye datos de
   * contacto. Límite bajo para desalentar el sondeo de ids.
   */
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Get('submission/:id')
  submission(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getSubmission(id);
  }

  // ── Rutas por cuestionario ──

  @Get(':key/content')
  contentByKey(@Param('key') key: string) {
    return this.service.getContent(key);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post(':key/submit')
  submitByKey(@Param('key') key: string, @Body() dto: SubmitStressTestDto) {
    return this.service.submit(dto, key);
  }
}
