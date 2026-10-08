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

  const allowedHeaders = [
    'Accept',
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'clerk-db-jwt',
  ];

  const allowedMethods = [
    'GET',
    'HEAD',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ];

  app.setGlobalPrefix('api');

  /*
   * Handle OPTIONS / CORS preflight FIRST.
   * Return HTTP 200 OK explicitly.
   */
  app.use(
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const origin = req.headers.origin;

      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader(
          'Access-Control-Allow-Methods',
          allowedMethods.join(', '),
        );
        res.setHeader(
          'Access-Control-Allow-Headers',
          allowedHeaders.join(', '),
        );
        res.setHeader('Access-Control-Max-Age', '86400');
        res.setHeader('Vary', 'Origin');
      }

      // IMPORTANT: Explicit HTTP 200 for preflight
      if (req.method === 'OPTIONS') {
        return res.status(200).json({
          success: true,
        });
      }

      next();
    },
  );

  /*
   * Clerk webhook needs raw body.
   */
  app.use(
    '/api/auth/webhook',
    express.raw({
      type: 'application/json',
    }),
  );

  /*
   * Nest CORS for normal requests.
   */
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(
          new Error(`CORS blocked origin: ${origin}`),
          false,
        );
      }
    },

    credentials: true,

    methods: allowedMethods,

    allowedHeaders,

    optionsSuccessStatus: 200,

    preflightContinue: false,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT || 3000);
}

bootstrap();