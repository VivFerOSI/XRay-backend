import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StressTestController } from './stress-test.controller';
import { StressTestService } from './stress-test.service';
import { StressTestSubmission } from './stress-test.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([StressTestSubmission]), EmailModule],
  controllers: [StressTestController],
  providers: [StressTestService],
})
export class StressTestModule {}
