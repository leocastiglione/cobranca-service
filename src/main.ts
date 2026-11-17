import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { readFileSync } from 'fs';

  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || '3306';

  if (!host) {
    throw new Error('DB_HOST não configurado.');
  }

  process.env.DATABASE_URL =
    `mysql://${encodeURIComponent(usuario)}:${encodeURIComponent(senha)}@${host}:${port}/${encodeURIComponent(database)}`;
}


(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

async function bootstrap(): Promise<void> {
  loadDockerSecrets();
  const { AppModule } = await import('./app.module.js');
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const config = app.get(ConfigService);
  const porta = config.get<number>('PORT', 3000);
  await app.listen(porta, '0.0.0.0');
  Logger.log(`API no ar em http:-/localhost:${porta}`, 'Bootstrap');  
}

void bootstrap();
