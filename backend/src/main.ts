import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication (supports localhost, LAN IPs e.g. 10.10.13.62, and FRONTEND_URL)
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      // Match localhost, 127.0.0.1, and private IPv4 ranges (10.x.x.x, 192.168.x.x, 172.16-31.x.x) on any port
      const isLocalOrLan = /^http:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(
        origin,
      );

      if (
        isLocalOrLan ||
        origin === process.env.FRONTEND_URL ||
        origin === 'http://localhost:3500' ||
        origin === 'http://localhost:3000' ||
        origin === 'http://10.10.13.62:3500' ||
        origin === 'http://10.10.13.62:3000'
      ) {
        return callback(null, true);
      }

      return callback(null, true);
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

  const port = process.env.PORT || 5000;
  // Bind to 0.0.0.0 so external devices on LAN (10.10.13.62) and containers can connect
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 FinFlow Backend is running on:`);
  console.log(`   - Local:   http://localhost:${port}/api`);
  console.log(`   - Network: http://10.10.13.62:${port}/api`);
}
bootstrap();

