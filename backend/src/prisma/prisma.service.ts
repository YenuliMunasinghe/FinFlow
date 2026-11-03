import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

/**
 * Prisma's interactive-transaction defaults (2s to acquire a connection, 5s
 * total) are too tight for a remote Supabase pooler: a few sequential round
 * trips can exceed them, Prisma closes the transaction mid-request and the
 * API returns 500 "Transaction not found". Every interactive transaction
 * should use one of these option sets.
 */
export const TRANSACTION_TIMEOUTS = {
  maxWait: 10_000,
  timeout: 30_000,
} as const;

export const SERIALIZABLE_TRANSACTION = {
  ...TRANSACTION_TIMEOUTS,
  isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
};

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private isConnected = false;

  async onModuleInit() {
    try {
      await this.$connect();
      this.isConnected = true;
      console.log('Prisma connected to database server successfully.');
    } catch (error: any) {
      this.isConnected = false;
      console.warn(
        'Prisma database connection warning:',
        error.message || error,
      );
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
