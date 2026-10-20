import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ReportsModule } from './reports/reports.module';
import { AuditModule } from './audit/audit.module';
import { AiInsightsModule } from './ai-insights/ai-insights.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    EventsModule,
    TransactionsModule,
    ReportsModule,
    AuditModule,
    AiInsightsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
