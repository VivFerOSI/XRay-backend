import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  ValidateNested,
} from 'class-validator';

export class AnswerInput {
  @IsInt()
  questionId: number;

  @IsInt()
  optionId: number;
}

/** Envío de todas las respuestas al finalizar el cuestionario. */
export class SubmitDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AnswerInput)
  answers: AnswerInput[];
}
