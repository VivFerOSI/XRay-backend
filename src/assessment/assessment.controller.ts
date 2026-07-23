import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { RegisterDto } from './dto/register.dto';
import { SubmitDto } from './dto/submit.dto';

@Controller('assessment')
export class AssessmentController {
  constructor(private readonly assessment: AssessmentService) {}

  /** Intro + roles + cuestionario (sin puntajes) para iniciar el flujo. */
  @Get('bootstrap')
  bootstrap() {
    return this.assessment.bootstrap();
  }

  /** Registra al participante y devuelve el id del intento. */
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.assessment.register(dto);
  }

  /** Envía todas las respuestas, calcula y guarda el resultado. */
  @Post(':id/submit')
  submit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitDto,
  ) {
    return this.assessment.submit(id, dto);
  }

  /** Resumen de resultados de un intento completado. */
  @Get(':id/result')
  result(@Param('id', ParseUUIDPipe) id: string) {
    return this.assessment.getResult(id);
  }
}
