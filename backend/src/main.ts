import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // ValidationPipe global -- intercepta todas as requisições, previne XSS e SQL Injection
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS -- em produção, FRONTEND_URL pode ser uma lista separada por vírgula
  const rawOrigins = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  const allowedOrigins = rawOrigins.split(',').map((o) => o.trim());

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origem não permitida -- ${origin}`));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Prefixo global para todas as rotas da API
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Backend rodando em http://localhost:${port}/api/v1`);
}

bootstrap();
