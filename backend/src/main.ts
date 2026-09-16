import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // ValidationPipe global — intercepta todas as requisições, previne XSS e SQL Injection
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove campos não declarados no DTO
      forbidNonWhitelisted: true, // Rejeita requisições com campos extras
      transform: true, // Transforma automaticamente os tipos (string -> number, etc.)
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS — permite apenas o frontend em desenvolvimento
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Prefixo global para todas as rotas da API
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Backend rodando em http://localhost:${port}/api/v1`);
}

await bootstrap();
