import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class StressAnswerInput {
  @IsInt()
  @Min(1)
  questionId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  value: number;
}

export class SubmitStressTestDto {
  /**
   * Cuestionario al que responde este envío. Opcional: si no viene, se toma
   * el de la URL y, en su defecto, el cuestionario por defecto.
   */
  @IsOptional()
  @IsString()
  @MaxLength(40)
  assessmentKey?: string;

  // ── Datos del emprendimiento ──
  /**
   * Los datos de organización se validan en el servicio contra los
   * `orgFields` del cuestionario: cuál es obligatorio depende de cada uno
   * (en el de líderes, el nombre de la organización es opcional).
   */
  @IsString()
  @MaxLength(120)
  nombreEmprendimiento: string;

  @IsString()
  @MaxLength(120)
  sector: string;

  @IsString()
  @MaxLength(60)
  antiguedad: string;

  @IsString()
  @MaxLength(60)
  tamanoEquipo: string;

  // ── Contacto (lead) ──
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  nombreContacto: string;

  @IsEmail()
  @MaxLength(120)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  telefono?: string;

  @IsBoolean()
  consent: boolean;

  // ── Respuestas ──
  @IsString()
  @IsNotEmpty()
  norte: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => StressAnswerInput)
  answers: StressAnswerInput[];
}
