import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssessmentDefinition } from './assessment-definition.entity';
import type { Assessment } from './types';
import { SEMILLAS } from './definitions';
import { validarYNormalizar } from './assessment-validacion';

/**
 * Provee las definiciones de los cuestionarios.
 *
 * Son la base de todo lo que sirve el módulo, se leen en cada request y
 * cambian muy de vez en cuando (solo cuando alguien las edita en el panel),
 * así que se mantienen en memoria y el cache se invalida al guardar.
 */
@Injectable()
export class AssessmentsService implements OnModuleInit {
  private readonly logger = new Logger(AssessmentsService.name);
  private cache: Assessment[] | null = null;

  constructor(
    @InjectRepository(AssessmentDefinition)
    private readonly repo: Repository<AssessmentDefinition>,
  ) {}

  /** Siembra la tabla la primera vez con las definiciones del código. */
  async onModuleInit(): Promise<void> {
    try {
      for (const [i, semilla] of SEMILLAS.entries()) {
        const existe = await this.repo.findOne({ where: { key: semilla.key } });
        if (!existe) {
          await this.repo.save(
            this.repo.create({
              key: semilla.key,
              definition: semilla,
              // Un cuestionario puede nacer escondido para publicarlo después
              // sin volver a desplegar: alcanza con activarlo en el panel.
              activo: semilla.activo ?? true,
              orden: i,
            }),
          );
          this.logger.log(`Cuestionario "${semilla.key}" sembrado en la base.`);
        }
      }
    } catch (err) {
      // Si la tabla todavía no existe (falta la migración), no se tumba el
      // arranque: las definiciones del código siguen sirviendo de respaldo.
      this.logger.error(
        `No se pudo sembrar los cuestionarios: ${(err as Error).message}`,
      );
    }
  }

  private async cargar(): Promise<Assessment[]> {
    if (this.cache) return this.cache;
    try {
      const filas = await this.repo.find({ order: { orden: 'ASC' } });
      if (filas.length > 0) {
        this.cache = filas.filter((f) => f.activo).map((f) => f.definition);
        return this.cache;
      }
    } catch (err) {
      this.logger.error(
        `Error leyendo los cuestionarios, se usan los del código: ${(err as Error).message}`,
      );
    }
    // Respaldo: las definiciones versionadas en el código.
    return SEMILLAS;
  }

  invalidarCache(): void {
    this.cache = null;
  }

  async listar(): Promise<Assessment[]> {
    return this.cargar();
  }

  /** Cuestionario por defecto: el que responden las rutas sin `:key`. */
  async porDefecto(): Promise<Assessment> {
    const todos = await this.cargar();
    return todos[0];
  }

  async obtener(key?: string): Promise<Assessment> {
    if (!key) return this.porDefecto();
    const encontrado = (await this.cargar()).find((a) => a.key === key);
    if (!encontrado) {
      throw new NotFoundException(`No existe la autoevaluación "${key}".`);
    }
    return encontrado;
  }

  // ── Administración ──

  /** Todas las definiciones, incluidas las inactivas. */
  async listarParaAdmin(): Promise<AssessmentDefinition[]> {
    return this.repo.find({ order: { orden: 'ASC' } });
  }

  async guardar(key: string, definition: Assessment): Promise<AssessmentDefinition> {
    const fila = await this.repo.findOne({ where: { key } });
    if (!fila) {
      throw new NotFoundException(`No existe la autoevaluación "${key}".`);
    }
    // La key no se cambia por acá: los envíos guardados la referencian.
    // `validarYNormalizar` renumera las preguntas y comprueba que las bandas
    // sigan cubriendo todo el rango de puntajes posible.
    fila.definition = validarYNormalizar({ ...definition, key });
    const guardado = await this.repo.save(fila);
    this.invalidarCache();
    return guardado;
  }
}
