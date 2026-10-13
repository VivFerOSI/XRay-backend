import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AdminService } from './admin.service';
import { AdminAuthGuard } from './admin-auth.guard';
import { PanelHabilitadoGuard } from './panel-habilitado.guard';
import { LoginDto } from './dto/login.dto';
import { AssessmentsService } from '../stress-test/assessments.service';
import type { Assessment } from '../stress-test/types';

@UseGuards(PanelHabilitadoGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly assessments: AssessmentsService,
  ) {}

  /** Límite bajo: es la puerta de entrada y conviene desalentar la fuerza bruta. */
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.admin.login(dto.email, dto.password);
  }

  // ── Cuestionarios ──

  @UseGuards(AdminAuthGuard)
  @Get('assessments')
  async listarAssessments() {
    const filas = await this.assessments.listarParaAdmin();
    return filas.map((f) => ({
      key: f.key,
      title: f.definition.title,
      shortName: f.definition.shortName,
      activo: f.activo,
      orden: f.orden,
      updatedAt: f.updatedAt,
      pilares: f.definition.pilares.length,
      preguntas: f.definition.pilares.reduce(
        (n, p) => n + p.questions.length,
        0,
      ),
    }));
  }

  @UseGuards(AdminAuthGuard)
  @Get('assessments/:key')
  async obtenerAssessment(@Param('key') key: string) {
    return this.assessments.obtener(key);
  }

  @UseGuards(AdminAuthGuard)
  @Put('assessments/:key')
  async guardarAssessment(
    @Param('key') key: string,
    @Body() definition: Assessment,
  ) {
    const guardado = await this.assessments.guardar(key, definition);
    return { key: guardado.key, updatedAt: guardado.updatedAt };
  }

  // ── Resultados ──

  @UseGuards(AdminAuthGuard)
  @Get('submissions')
  listarSubmissions(
    @Query('assessmentKey') assessmentKey?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('pagina') pagina?: string,
    @Query('porPagina') porPagina?: string,
  ) {
    return this.admin.listarSubmissions({
      assessmentKey,
      desde,
      hasta,
      pagina: pagina ? Number(pagina) : undefined,
      porPagina: porPagina ? Number(porPagina) : undefined,
    });
  }

  @UseGuards(AdminAuthGuard)
  @Get('submissions/export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="xray-resultados.csv"')
  exportar(
    @Query('assessmentKey') assessmentKey?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.admin.exportarCsv({ assessmentKey, desde, hasta });
  }

  /**
   * Detalle de un envío. Declarado después de `export.csv`: Nest resuelve las
   * rutas en orden y `:id` se tragaría esa ruta estática.
   */
  @UseGuards(AdminAuthGuard)
  @Get('submissions/:id')
  detalleSubmission(@Param('id', ParseUUIDPipe) id: string) {
    return this.admin.detalleSubmission(id);
  }

  // ── Evaluaciones 360° ──

  @UseGuards(AdminAuthGuard)
  @Get('evaluaciones-360')
  listarRondas360(
    @Query('assessmentKey') assessmentKey?: string,
    @Query('estado') estado?: string,
    @Query('pagina') pagina?: string,
    @Query('porPagina') porPagina?: string,
  ) {
    return this.admin.listarRondas360({
      assessmentKey,
      estado,
      pagina: pagina ? Number(pagina) : undefined,
      porPagina: porPagina ? Number(porPagina) : undefined,
    });
  }

  /** El id es el de la autoevaluación: hay una sola ronda por cada una. */
  @UseGuards(AdminAuthGuard)
  @Get('evaluaciones-360/:submissionId')
  detalleRonda360(@Param('submissionId', ParseUUIDPipe) submissionId: string) {
    return this.admin.detalleRonda360(submissionId);
  }
}
