import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { AppModule } from './app.module';

const ALLOWED_ORIGINS = [
  'https://qauntaai.au',
  'https://www.qauntaai.au',
  'https://quantaai.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

const ALLOWED_HEADERS = [
  'Accept',
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'clerk-db-jwt',
  'x-clerk-auth-status',
  'x-clerk-auth-reason',
  'x-clerk-clerk-db-jwt',
];

const ALLOWED_METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Clerk Webhook: Raw body parser must be mounted before global middleware/body parsers
  app.use('/api/auth/webhook', express.raw({ type: 'application/json' }));

  // Native NestJS CORS (Handles origin verification and preflight OPTIONS cleanly)
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server, curl, Postman) or matched origins
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`[CORS Blocked Origin]: ${origin}`);
      // Returning false prevents NestJS from throwing an uncaught 500 exception
      return callback(null, false);
    },
    credentials: true,
    methods: ALLOWED_METHODS,
    allowedHeaders: ALLOWED_HEADERS,
    optionsSuccessStatus: 200,
  });

  // Global DTO Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

bootstrap();