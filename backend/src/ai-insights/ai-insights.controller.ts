
import { Controller, Get } from '@nestjs/common';
import { AiInsightsService } from './ai-insights.service';

@Controller('ai-insights')
export class AiInsightsController {
  constructor(
    private readonly aiInsightsService: AiInsightsService,
  ) {}

  @Get('demo')
  getDemoAnalysis() {
    return this.aiInsightsService.getDemoAnalysis();
  }
}
