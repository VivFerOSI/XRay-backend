import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Rol declarable por el usuario. `level` ordena los roles de menor a mayor
 * (Empleado=1 … Director=5) y es lo que permite calcular si el desvío de las
 * respuestas fue hacia un rol inferior o superior.
 */
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  /** Identificador estable para el frontend/seed, p. ej. 'empleado'. */
  @Column({ unique: true })
  key: string;

  @Column()
  name: string;

  @Column({ type: 'int', unique: true })
  level: number;

  @Column({ default: true })
  isActive: boolean;
}
