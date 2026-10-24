import { Test, TestingModule } from '@nestjs/testing';
import { AiInsightsController } from './ai-insights.controller';
import { AiInsightsService } from './ai-insights.service';

describe('AiInsightsController', () => {
  let controller: AiInsightsController;
  const aiInsightsService = {
    getDemoAnalysis: jest.fn(),
    getEventAnalysis: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiInsightsController],
      providers: [
        {
          provide: AiInsightsService,
          useValue: aiInsightsService,
        },
      ],
    }).compile();

    controller = module.get<AiInsightsController>(AiInsightsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('forwards an event ID to the insights service', async () => {
    aiInsightsService.getEventAnalysis.mockResolvedValue({
      status: 'generated',
    });

    await expect(controller.getEventAnalysis('event-1')).resolves.toEqual({
      status: 'generated',
    });
    expect(aiInsightsService.getEventAnalysis).toHaveBeenCalledWith('event-1');
  });
});
