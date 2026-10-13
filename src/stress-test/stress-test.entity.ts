import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { GlobalLevel } from './types';

/**
 * Cada envío del Stress Test: datos del emprendimiento, contacto (lead),
 * respuestas y resultado calculado. Es la base de leads del embudo.
 */
@Entity('stress_test_submissions')
export class StressTestSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  /**
   * Cuestionario al que pertenece el envío ('emprendimiento', 'lider', ...).
   * Los envíos anteriores al motor multicuestionario son de 'emprendimiento',
   * de ahí el default.
   */
  @Column({ default: 'emprendimiento' })
  assessmentKey: string;

  // ── Datos del emprendimiento ──
  @Column()
  nombreEmprendimiento: string;

  @Column()
  sector: string;

  @Column()
  antiguedad: string;

  @Column()
  tamanoEquipo: string;

  // ── Contacto (lead) ──
  @Column()
  nombreContacto: string;

  @Column()
  email: string;

  @Column({ type: 'varchar', nullable: true })
  telefono: string | null;

  /** Consentimiento para el tratamiento de datos de contacto. */
  @Column({ default: false })
  consent: boolean;

  // ── Respuestas y resultado ──
  /** Norte de liderazgo elegido ('aceleracion' | 'estructura'). */
  @Column()
  norte: string;

  /** Respuestas Likert por pregunta: { "1": 5, "2": 3, ... } */
  @Column({ type: 'jsonb' })
  answers: Record<string, number>;

  /** Puntaje por pilar: { "resiliencia": 22, ... } */
  @Column({ type: 'jsonb' })
  pilarScores: Record<string, number>;

  @Column({ type: 'int' })
  totalScore: number;

  @Column()
  globalLevel: GlobalLevel;
}
