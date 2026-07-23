import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Datos del formulario de ingreso; crea el participante y abre un intento. */
export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName: string;

  @IsEmail()
  @MaxLength(160)
  email: string;

  @IsInt()
  declaredRoleId: number;

  @IsOptional()
  @IsBoolean()
  wantsEmailResults?: boolean;
}
