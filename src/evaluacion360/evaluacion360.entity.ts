import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StressTestSubmission } from '../stress-test/stress-test.entity';

export type EstadoRonda = 'abierta' | 'cerrada';

/**
 * Una ronda de evaluación 360°: la autoevaluación de una persona más las
 * respuestas de quienes invitó.
 *
 * El informe comparativo se arma al cerrarse la ronda, que ocurre cuando
 * respondieron todos los invitados o cuando vence el plazo, lo que pase
 * primero.
 */
@Entity('evaluaciones_360')
export class Evaluacion360 {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  /** Autoevaluación contra la que se comparan las respuestas de terceros. */
  @Column({ type: 'uuid' })
  @Index()
  submissionId: string;

  @ManyToOne(() => StressTestSubmission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submission_id' })
  submission: StressTestSubmission;

  @Column()
  assessmentKey: string;

  /** Hasta cuándo pueden responder los invitados. */
  @Column({ type: 'timestamp' })
  @Index()
  venceEl: Date;

  @Column({ type: 'varchar', default: 'abierta' })
  @Index()
  estado: EstadoRonda;

  /** Cuándo se envió el informe comparativo al evaluado. */
  @Column({ type: 'timestamp', nullable: true })
  informeEnviadoEl: Date | null;

  @OneToMany(() => Evaluador360, (e) => e.ronda, { cascade: true })
  evaluadores: Evaluador360[];
}

export type EstadoEvaluador = 'pendiente' | 'respondido';

/** Cada persona invitada a evaluar. El token es su credencial de acceso. */
@Entity('evaluadores_360')
export class Evaluador360 {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Evaluacion360, (r) => r.evaluadores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ronda_id' })
  ronda: Evaluacion360;

  @Column({ type: 'uuid' })
  @Index()
  rondaId: string;

  @Column()
  nombre: string;

  @Column()
  email: string;

  /**
   * Credencial del enlace que recibe por correo. Es un valor aleatorio largo,
   * no un uuid: identifica y autoriza a la vez, así que no debe ser adivinable
   * ni derivarse de nada.
   */
  @Column({ unique: true })
  @Index()
  token: string;

  @Column({ type: 'varchar', default: 'pendiente' })
  estado: EstadoEvaluador;

  /** Respuestas Likert por pregunta: { "1": 4, "2": 3, ... } */
  @Column({ type: 'jsonb', nullable: true })
  answers: Record<string, number> | null;

  @Column({ type: 'timestamp', nullable: true })
  respondioEl: Date | null;

  /** Cuántos recordatorios se le mandaron, para no insistir de más. */
  @Column({ type: 'int', default: 0 })
  recordatorios: number;

  @Column({ type: 'timestamp', nullable: true })
  ultimoRecordatorio: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
