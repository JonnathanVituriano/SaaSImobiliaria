import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Prefixo global da API: todas as rotas começam com /api/v1
  app.setGlobalPrefix('api/v1');

  // Validação automática dos DTOs com class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // Remove campos que não estão no DTO
      forbidNonWhitelisted: true, // Retorna erro se enviar campo não esperado
      transform: true,        // Converte tipos automaticamente (string → number, etc.)
    }),
  );

  // CORS — em dev, permite tudo. Em prod, restringir.
  app.enableCors({
    origin: process.env.APP_ENV === 'production'
      ? ['https://seudominio.com.br']  // substituir pelo domínio real
      : true,
    credentials: true,
  });

  const port = process.env.APP_PORT || 3001;
  await app.listen(port);
  console.log(`🚀 API rodando em http://localhost:${port}/api/v1`);
}

bootstrap();
