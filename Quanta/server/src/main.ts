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
   * Handle CORS preflight before authentication,
   * guards, controllers, etc.
   */
  app.use(
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const origin = req.headers.origin;

      if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header(
          'Access-Control-Allow-Methods',
          allowedMethods.join(', '),
        );
        res.header(
          'Access-Control-Allow-Headers',
          allowedHeaders.join(', '),
        );
        res.header('Access-Control-Max-Age', '86400');
        res.header('Vary', 'Origin');
      }

      if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
      }

      next();
    },
  );

  /*
   * Clerk webhook requires the raw request body.
   */
  app.use(
    '/api/auth/webhook',
    express.raw({ type: 'application/json' }),
  );

  /*
   * Nest CORS for normal requests.
   */
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked origin: ${origin}`),
        false,
      );
    },

    credentials: true,
    methods: allowedMethods,
    allowedHeaders,
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