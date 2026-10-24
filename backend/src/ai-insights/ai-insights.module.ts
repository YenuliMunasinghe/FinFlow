import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AiInsightsController } from './ai-insights.controller';
import { AiInsightsService } from './ai-insights.service';
import { FinancialAnalysisService } from './financial-analysis.service';
import { FinancialInsightService } from './financial-insight.service';
import { GeminiNarrativeService } from './gemini-narrative.service';

@Module({
  imports: [PrismaModule],
  controllers: [AiInsightsController],
  providers: [
    AiInsightsService,
    FinancialAnalysisService,
    FinancialInsightService,
    GeminiNarrativeService,
  ],
})
export class AiInsightsModule {}
