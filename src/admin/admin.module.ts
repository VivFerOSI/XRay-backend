import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminAuthGuard } from './admin-auth.guard';
import { PanelHabilitadoGuard } from './panel-habilitado.guard';
import { StressTestSubmission } from '../stress-test/stress-test.entity';
import { StressTestModule } from '../stress-test/stress-test.module';
import { Evaluacion360 } from '../evaluacion360/evaluacion360.entity';
import { Evaluacion360Module } from '../evaluacion360/evaluacion360.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StressTestSubmission, Evaluacion360]),
    // StressTestModule exporta AssessmentsService: el panel edita las mismas
    // definiciones que sirve el sitio.
    StressTestModule,
    // Evaluacion360Module exporta Evaluacion360Service: el panel muestra el
    // mismo comparativo que se manda por correo, sin recalcularlo aparte.
    Evaluacion360Module,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'cambiar-en-produccion'),
        // El tipo de jsonwebtoken exige un literal; 8h cubre una jornada.
        signOptions: { expiresIn: '8h' },
      }),
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminAuthGuard, PanelHabilitadoGuard],
})
export class AdminModule {}
