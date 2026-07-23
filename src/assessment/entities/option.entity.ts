import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from './question.entity';
import { Role } from './role.entity';
import { OptionScore } from './option-score.entity';

/**
 * Opción de respuesta a una pregunta. `alignedRole` indica a qué rol "pertenece"
 * la conducta que describe la opción; se usa para determinar la dirección del
 * desvío (hacia rol inferior o superior) respecto del rol declarado.
 */
@Entity('options')
export class Option {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Question, (question) => question.options, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ name: 'question_id' })
  questionId: number;

  @Column({ type: 'text' })
  text: string;

  @ManyToOne(() => Role, { nullable: true })
  @JoinColumn({ name: 'aligned_role_id' })
  alignedRole: Role | null;

  @Column({ name: 'aligned_role_id', nullable: true })
  alignedRoleId: number | null;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @OneToMany(() => OptionScore, (score) => score.option, { cascade: true })
  scores: OptionScore[];
}
