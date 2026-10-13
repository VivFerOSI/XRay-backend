import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evaluacion360, Evaluador360 } from './evaluacion360.entity';
import { Evaluacion360Service } from './evaluacion360.service';
import { Evaluacion360Controller } from './evaluacion360.controller';
import { StressTestSubmission } from '../stress-test/stress-test.entity';
import { StressTestModule } from '../stress-test/stress-test.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Evaluacion360, Evaluador360, StressTestSubmission]),
    // StressTestModule exporta AssessmentsService: el 360° usa las mismas
    // definiciones que el cuestionario original.
    StressTestModule,
    EmailModule,
  ],
  controllers: [Evaluacion360Controller],
  providers: [Evaluacion360Service],
  exports: [Evaluacion360Service],
})
export class Evaluacion360Module {}
