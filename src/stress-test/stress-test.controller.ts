import { Body, Controller, Get, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { StressTestService } from './stress-test.service';
import { SubmitStressTestDto } from './dto/submit-stress-test.dto';

@Controller('stress-test')
export class StressTestController {
  constructor(private readonly service: StressTestService) {}

  /** Contenido del formulario (datos, escala, pilares con preguntas, norte). */
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
}
