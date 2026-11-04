import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { configureApp } from './app.setup';
import { ExpressAdapter } from '@nestjs/platform-express';
import express = require('express');
import { Express } from 'express';

export const server: Express = express();
let cachedApp: INestApplication;

export async function createApp(expressInstance: Express): Promise<INestApplication> {
  if (!cachedApp) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressInstance),
    );

    configureApp(app);

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


