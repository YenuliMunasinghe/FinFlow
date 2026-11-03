import { INestApplication, ValidationPipe } from '@nestjs/common';

/**
 * HTTP pipeline shared by the real server (main.ts) and e2e tests, so tests
 * exercise the same prefix, CORS and validation rules as production.
 */
export function configureApp(app: INestApplication): INestApplication {
  // Enable CORS for all domains (Vercel, LAN, and Localhost)
  app.enableCors({
    origin: (origin, callback) => {
      // Allow all origins for API access
      callback(null, true);
    },
    credentials: true,
  });

  // Global prefix for all REST endpoints: /api/...
  app.setGlobalPrefix('api');

  // Automatically validate and transform request payloads (DTOs)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  return app;
}
