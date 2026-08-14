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
  @Max(25)
  questionId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  value: number;
}

export class SubmitStressTestDto {
  // ── Datos del emprendimiento ──
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombreEmprendimiento: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  sector: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  antiguedad: string;

  @IsString()
  @IsNotEmpty()
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
  @IsIn(['aceleracion', 'estructura'])
  norte: string;

  @IsArray()
  @ArrayMinSize(25)
  @ArrayMaxSize(25)
  @ValidateNested({ each: true })
  @Type(() => StressAnswerInput)
  answers: StressAnswerInput[];
}
