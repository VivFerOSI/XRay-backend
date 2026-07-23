import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Participant } from './participant.entity';
import { Answer } from './answer.entity';
import { numericTransformer } from './numeric.transformer';

export type AssessmentStatus = 'in_progress' | 'completed';

/** Dirección del desvío de las respuestas respecto del rol declarado. */
export type DeviationDirection = 'aligned' | 'inferior' | 'superior';

/** Un intento de autoevaluación con su resultado calculado. */
@Entity('assessments')
export class Assessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Participant, (participant) => participant.assessments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'participant_id' })
  participant: Participant;

  @Column({ name: 'participant_id' })
  participantId: string;

  /** Rol declarado al momento del intento (snapshot, por si el rol cambia). */
  @ManyToOne(() => Role)
  @JoinColumn({ name: 'declared_role_id' })
  declaredRole: Role;

  @Column({ name: 'declared_role_id' })
  declaredRoleId: number;

  @Column({ type: 'varchar', default: 'in_progress' })
  status: AssessmentStatus;

  @Column({
    type: 'numeric',
    precision: 8,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  totalScore: number;

  @Column({
    type: 'numeric',
    precision: 8,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  maxScore: number;

  /** Porcentaje de alineación (totalScore / maxScore * 100). */
  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  alignmentPct: number;

  @Column({ type: 'varchar', name: 'deviation', default: 'aligned' })
  deviation: DeviationDirection;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @OneToMany(() => Answer, (answer) => answer.assessment, { cascade: true })
  answers: Answer[];
}
