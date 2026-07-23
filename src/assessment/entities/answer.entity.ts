import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Assessment } from './assessment.entity';
import { Question } from './question.entity';
import { Option } from './option.entity';
import { numericTransformer } from './numeric.transformer';

/** Respuesta elegida por el usuario para una pregunta dentro de un intento. */
@Entity('answers')
@Unique(['assessmentId', 'questionId'])
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Assessment, (assessment) => assessment.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'assessment_id' })
  assessment: Assessment;

  @Column({ name: 'assessment_id' })
  assessmentId: string;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ name: 'question_id' })
  questionId: number;

  @ManyToOne(() => Option)
  @JoinColumn({ name: 'option_id' })
  option: Option;

  @Column({ name: 'option_id' })
  optionId: number;

  /** Puntaje otorgado para el rol declarado (snapshot del scoring). */
  @Column({
    type: 'numeric',
    precision: 6,
    scale: 2,
    transformer: numericTransformer,
  })
  scoreAwarded: number;
}
