import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private isConnected = false;

  async onModuleInit() {
    try {
      await this.$connect();
      this.isConnected = true;
      console.log('Prisma connected to database server successfully.');
    } catch (error: any) {
      this.isConnected = false;
      console.warn('Prisma database connection warning:', error.message || error);
    }
  }

  isDbAvailable(): boolean {
    return this.isConnected;
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.isConnected = false;
    } catch {
      // Ignore disconnect errors
    }
  }
}
