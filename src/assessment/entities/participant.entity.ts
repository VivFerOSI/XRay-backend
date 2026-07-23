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
import { Assessment } from './assessment.entity';

/** Persona que realiza la autoevaluación. Puede tener más de un intento. */
@Entity('participants')
export class Participant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'declared_role_id' })
  declaredRole: Role;

  @Column({ name: 'declared_role_id' })
  declaredRoleId: number;

  /** El usuario pidió recibir los resultados por correo. */
  @Column({ default: false })
  wantsEmailResults: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Assessment, (assessment) => assessment.participant)
  assessments: Assessment[];
}
