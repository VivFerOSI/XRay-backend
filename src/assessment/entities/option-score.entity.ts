import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Option } from './option.entity';
import { Role } from './role.entity';
import { numericTransformer } from './numeric.transformer';

/**
 * Núcleo del scoring dinámico: puntaje que otorga una opción PARA CADA rol.
 * La misma respuesta puede valer distinto según el rol declarado por el usuario.
 * Todo el criterio de valoración vive en estos registros (editables en la DB),
 * sin lógica hardcodeada.
 */
@Entity('option_scores')
@Unique(['optionId', 'roleId'])
export class OptionScore {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Option, (option) => option.scores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'option_id' })
  option: Option;

  @Column({ name: 'option_id' })
  optionId: number;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'role_id' })
  roleId: number;

  @Column({
    type: 'numeric',
    precision: 6,
    scale: 2,
    transformer: numericTransformer,
  })
  score: number;
}
