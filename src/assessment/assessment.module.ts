import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentController } from './assessment.controller';
import { AssessmentService } from './assessment.service';
import { ScoringService } from './scoring.service';
import { EmailModule } from '../email/email.module';
import { Role } from './entities/role.entity';
import { Category } from './entities/category.entity';
import { Question } from './entities/question.entity';
import { Option } from './entities/option.entity';
import { OptionScore } from './entities/option-score.entity';
import { Participant } from './entities/participant.entity';
import { Assessment } from './entities/assessment.entity';
import { Answer } from './entities/answer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      Category,
      Question,
      Option,
      OptionScore,
      Participant,
      Assessment,
      Answer,
    ]),
    EmailModule,
  ],
  controllers: [AssessmentController],
  providers: [AssessmentService, ScoringService],
})
export class AssessmentModule {}
