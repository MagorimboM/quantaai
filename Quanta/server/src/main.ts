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

  /*
   * IMPORTANT:
   * Handle CORS preflight BEFORE Nest routes, guards,
   * authentication middleware, and controllers.
   */
  app.use(
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const origin = req.headers.origin;

      // Only apply CORS headers to approved browser origins.
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

      /*
       * CRITICAL:
       * Return a successful response for every OPTIONS request.
       *
       * This happens BEFORE authentication guards/controllers.
       */
      if (req.method === 'OPTIONS') {
        return res.status(204).end();
      }

      next();
    },
  );

  /*
   * Clerk webhook needs the raw request body.
   */
  app.use(
    '/api/auth/webhook',
    express.raw({ type: 'application/json' }),
  );

  /*
   * All API routes use /api.
   */
  app.setGlobalPrefix('api');

  /*
   * Keep Nest CORS enabled for normal requests as well.
   * The middleware above handles OPTIONS explicitly.
   */
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`), false);
    },

    credentials: true,

    methods: allowedMethods,

    allowedHeaders,

    preflightContinue: false,

    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();