import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express } from 'express';

export const server: Express = express();
let cachedApp: INestApplication;

export async function createApp(expressInstance: Express): Promise<INestApplication> {
  if (!cachedApp) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressInstance),
    );

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

    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

// Standalone server mode (Local & LAN dev/production)
if (!process.env.VERCEL) {
  async function bootstrap() {
    const app = await createApp(server);
    const port = process.env.PORT || 5000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 FinFlow Backend is running on:`);
    console.log(`   - Local:   http://localhost:${port}/api`);
    console.log(`   - Network: http://10.10.13.62:${port}/api`);
  }
  bootstrap();
}

// Export handler for Vercel Serverless Functions
export default async function handler(req: any, res: any) {
  await createApp(server);
  server(req, res);
}


