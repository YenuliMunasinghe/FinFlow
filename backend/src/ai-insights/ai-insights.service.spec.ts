import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AiInsightsService } from './ai-insights.service';
import { FinancialAnalysisService } from './financial-analysis.service';
import { FinancialInsightService } from './financial-insight.service';
import { GeminiNarrativeService } from './gemini-narrative.service';

describe('AiInsightsService', () => {
  let service: AiInsightsService;
  const prisma = {
    isDbAvailable: jest.fn(),
    event: {
      findUnique: jest.fn(),
    },
  };
  const geminiNarrativeService = {
    generate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiInsightsService,
        FinancialAnalysisService,
        FinancialInsightService,
        {
          provide: GeminiNarrativeService,
          useValue: geminiNarrativeService,
        },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AiInsightsService>(AiInsightsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns demo data produced by the financial calculator', () => {
    expect(service.getDemoAnalysis()).toEqual(
      expect.objectContaining({
        status: 'demo',
        budgetStatus: 'OVER_BUDGET',
        metrics: expect.objectContaining({
          allocatedBudget: 100000,
          approvedExpenses: 112000,
          remainingBudget: -12000,
        }),
        insights: expect.arrayContaining([
          expect.objectContaining({ code: 'BUDGET_OVERSPENT' }),
        ]),
      }),
    );
  });

  it('loads and analyzes an event from Prisma', async () => {
    prisma.isDbAvailable.mockReturnValue(true);
    geminiNarrativeService.generate.mockResolvedValue({
      source: 'gemini',
      summary: 'The event is currently within budget.',
    });
    prisma.event.findUnique.mockResolvedValue({
      id: 'event-1',
      name: 'Tech Symposium',
      status: 'APPROVED',
      totalBudget: '100000.00',
      budgetItems: [
        {
          allocatedAmount: '30000.00',
          category: { name: 'Catering' },
        },
        {
          allocatedAmount: '20000.00',
          category: { name: 'Catering' },
        },
        {
          allocatedAmount: '50000.00',
          category: { name: 'Venue' },
        },
      ],
      transactions: [
        {
          amount: '45000.00',
          type: 'EXPENSE',
          status: 'APPROVED',
          budgetItem: { category: { name: 'Catering' } },
        },
        {
          amount: '10000.00',
          type: 'EXPENSE',
          status: 'PENDING',
          budgetItem: { category: { name: 'Catering' } },
        },
        {
          amount: '15000.00',
          type: 'INCOME',
          status: 'APPROVED',
          budgetItem: null,
        },
        {
          amount: '9000.00',
          type: 'EXPENSE',
          status: 'REJECTED',
          budgetItem: { category: { name: 'Venue' } },
        },
      ],
    });

    const result = await service.getEventAnalysis('event-1');

    expect(prisma.event.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'event-1' } }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        status: 'generated',
        generatedAt: expect.any(String),
        event: {
          id: 'event-1',
          name: 'Tech Symposium',
          status: 'APPROVED',
        },
        metrics: expect.objectContaining({
          allocatedBudget: 100000,
          approvedIncome: 15000,
          approvedExpenses: 45000,
          pendingExpenses: 10000,
          remainingBudget: 55000,
        }),
        insights: expect.arrayContaining([
          expect.objectContaining({
            code: 'BUDGET_HEALTHY',
            scope: 'EVENT',
          }),
          expect.objectContaining({
            code: 'BUDGET_NEAR_LIMIT',
            scope: 'CATEGORY',
            category: 'Catering',
          }),
        ]),
        aiNarrative: expect.objectContaining({
          source: 'gemini',
          summary: 'The event is currently within budget.',
        }),
      }),
    );
    expect(result.categoryBreakdown).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: 'Catering',
          allocatedBudget: 50000,
          approvedExpenses: 45000,
          pendingExpenses: 10000,
        }),
      ]),
    );
    expect(geminiNarrativeService.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        event: expect.objectContaining({ id: 'event-1' }),
        analysis: expect.any(Object),
        insights: expect.any(Array),
      }),
    );
  });

  it('returns not found when Prisma has no matching event', async () => {
    prisma.isDbAvailable.mockReturnValue(true);
    prisma.event.findUnique.mockResolvedValue(null);

    await expect(service.getEventAnalysis('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('does not replace unavailable database data with demo values', async () => {
    prisma.isDbAvailable.mockReturnValue(false);

    await expect(service.getEventAnalysis('event-1')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(prisma.event.findUnique).not.toHaveBeenCalled();
  });
});
