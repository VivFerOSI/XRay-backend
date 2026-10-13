import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StressTestController } from './stress-test.controller';
import { StressTestService } from './stress-test.service';
import { StressTestSubmission } from './stress-test.entity';
import { AssessmentDefinition } from './assessment-definition.entity';
import { AssessmentsService } from './assessments.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StressTestSubmission, AssessmentDefinition]),
    EmailModule,
  ],
  controllers: [StressTestController],
  providers: [StressTestService, AssessmentsService],
  exports: [AssessmentsService],
})
export class StressTestModule {}
