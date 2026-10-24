import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiInsightsService } from './ai-insights.service';

@Controller('ai-insights')
export class AiInsightsController {
  constructor(private readonly aiInsightsService: AiInsightsService) {}

  @Get('demo')
  getDemoAnalysis() {
    return this.aiInsightsService.getDemoAnalysis();
  }

  @Get('events/:eventId')
  @UseGuards(JwtAuthGuard)
  getEventAnalysis(@Param('eventId') eventId: string) {
    return this.aiInsightsService.getEventAnalysis(eventId);
  }
}
