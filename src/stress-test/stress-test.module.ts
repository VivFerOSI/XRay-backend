import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StressTestController } from './stress-test.controller';
import { StressTestService } from './stress-test.service';
import { StressTestSubmission } from './stress-test.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StressTestSubmission])],
  controllers: [StressTestController],
  providers: [StressTestService],
})
export class StressTestModule {}
