import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import type { Assessment } from './types';

/**
 * Definición de un cuestionario, editable desde el panel de administración.
 *
 * La tabla se llama `assessment_definitions` y no `assessments` porque ese
 * nombre ya lo ocupa el módulo de competencias anterior (`src/assessment/`).
 *
 * Se guarda como documento JSON en vez de normalizar pilares, preguntas,
 * bandas y cruces en tablas aparte: el contenido se lee y se edita siempre
 * entero, no hay consultas que crucen sus partes, y así la definición en base
 * tiene exactamente la misma forma que el tipo `Assessment` del código.
 *
 * Los archivos de `definitions/` pasan a ser la semilla inicial: siembran la
 * tabla la primera vez y después mandan los datos.
 */
@Entity('assessment_definitions')
export class AssessmentDefinition {
  /** Identificador del cuestionario ('emprendimiento', 'lider', ...). */
  @PrimaryColumn()
  key: string;

  @Column({ type: 'jsonb' })
  definition: Assessment;

  /** Si está en false, no se sirve al público (sirve para preparar uno nuevo). */
  @Column({ default: true })
  activo: boolean;

  /** Orden en el listado del panel y del sitio. */
  @Column({ type: 'int', default: 0 })
  orden: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
