import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
