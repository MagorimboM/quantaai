import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'https://qauntaai.au',
    'https://www.qauntaai.au',
    'https://quantaai.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  app.setGlobalPrefix('api');

  // Clerk webhook needs the raw request body.
  app.use(
    '/api/auth/webhook',
    express.raw({ type: 'application/json' }),
  );

  // CORS
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no Origin header
      // (server-to-server, Postman, health checks, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked origin: ${origin}`),
        false,
      );
    },

    credentials: true,

    methods: [
      'GET',
      'HEAD',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Accept',
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'clerk-db-jwt',
    ],

    optionsSuccessStatus: 204,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();