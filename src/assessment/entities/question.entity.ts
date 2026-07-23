import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Option } from './option.entity';

/** Pregunta = una situación laboral con varias opciones de respuesta. */
@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Category, (category) => category.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'category_id' })
  categoryId: number;

  /** Enunciado de la situación laboral planteada. */
  @Column({ type: 'text' })
  situation: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Option, (option) => option.question, { cascade: true })
  options: Option[];
}
