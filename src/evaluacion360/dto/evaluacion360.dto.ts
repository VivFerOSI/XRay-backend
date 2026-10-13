import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class EvaluadorInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  nombre: string;

  @IsEmail()
  @MaxLength(120)
  email: string;
}

export class InvitarDto {
  @IsArray()
  @ArrayMinSize(1)
  // El tope real lo define el cuestionario; acá sólo se corta un abuso obvio.
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => EvaluadorInput)
  evaluadores: EvaluadorInput[];
}

export class RespuestaInput {
  @IsInt()
  @Min(1)
  questionId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  value: number;
}

export class ResponderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => RespuestaInput)
  answers: RespuestaInput[];
}
