import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Detrás del proxy de Cloud Run: confiar en X-Forwarded-For para que el
  // rate-limiting cuente por IP real del visitante (no la del proxy).
  app.set('trust proxy', 1);

  // Los endpoints del módulo cuelgan de /api; la raíz '/' queda libre para el
  // health-check/smoke-test documentado en GCP_DEPLOY.md.
  app.setGlobalPrefix('api', { exclude: ['/'] });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const origin = process.env.FRONTEND_ORIGIN?.split(',').map((o) => o.trim());
  app.enableCors({ origin: origin ?? true, credentials: true });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
