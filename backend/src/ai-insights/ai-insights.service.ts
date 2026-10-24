import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FinancialAnalysisService } from './financial-analysis.service';
import { FinancialInsightService } from './financial-insight.service';
import { GeminiNarrativeService } from './gemini-narrative.service';
import {
  BudgetCategoryInput,
  FinancialTransactionStatus,
  FinancialTransactionType,
} from './interfaces/financial-analysis.interface';

@Injectable()
export class AiInsightsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly financialAnalysisService: FinancialAnalysisService,
    private readonly financialInsightService: FinancialInsightService,
    private readonly geminiNarrativeService: GeminiNarrativeService,
  ) {}

  async getEventAnalysis(eventId: string) {
    if (!this.prisma.isDbAvailable()) {
      throw new ServiceUnavailableException(
        'Financial insights require an active database connection.',
      );
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        status: true,
        totalBudget: true,
        budgetItems: {
          select: {
            allocatedAmount: true,
            category: {
              select: { name: true },
            },
          },
        },
        transactions: {
          select: {
            amount: true,
            type: true,
            status: true,
            budgetItem: {
              select: {
                category: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found.`);
    }

    const analysis = this.financialAnalysisService.analyze({
      allocatedBudget: Number(event.totalBudget),
      budgetCategories: this.aggregateBudgetCategories(event.budgetItems),
      transactions: event.transactions.flatMap((transaction) => {
        if (
          !this.isSupportedTransactionType(transaction.type) ||
          !this.isSupportedTransactionStatus(transaction.status)
        ) {
          return [];
        }

        return [
          {
            amount: Number(transaction.amount),
            type: transaction.type,
            status: transaction.status,
            category: transaction.budgetItem?.category.name,
          },
        ];
      }),
    });
    const insights = this.financialInsightService.generate(analysis);
    const aiNarrative = await this.geminiNarrativeService.generate({
      event: {
        id: event.id,
        name: event.name,
        status: event.status,
      },
      analysis,
      insights,
    });

    return {
      status: 'generated',
      generatedAt: new Date().toISOString(),
      event: {
        id: event.id,
        name: event.name,
        status: event.status,
      },
      ...analysis,
      insights,
      aiNarrative,
    };
  }

  getDemoAnalysis() {
    const analysis = this.financialAnalysisService.analyze({
      allocatedBudget: 100000,
      transactions: [
        {
          amount: 112000,
          type: 'EXPENSE',
          status: 'APPROVED',
        },
      ],
    });
    const insights = this.financialInsightService.generate(analysis);

    return {
      status: 'demo',
      ...analysis,
      insights,
    };
  }

  private aggregateBudgetCategories(
    budgetItems: Array<{
      allocatedAmount: unknown;
      category: { name: string };
    }>,
  ): BudgetCategoryInput[] {
    const allocations = new Map<string, number>();

    for (const item of budgetItems) {
      const category = item.category.name;
      allocations.set(
        category,
        (allocations.get(category) ?? 0) + Number(item.allocatedAmount),
      );
    }

    return Array.from(allocations, ([category, allocatedBudget]) => ({
      category,
      allocatedBudget,
    }));
  }

  private isSupportedTransactionType(
    type: string,
  ): type is FinancialTransactionType {
    return type === 'INCOME' || type === 'EXPENSE';
  }

  private isSupportedTransactionStatus(
    status: string,
  ): status is FinancialTransactionStatus {
    return (
      status === 'APPROVED' ||
      status === 'PENDING' ||
      status === 'REJECTED' ||
      status === 'REVISION_REQUESTED'
    );
  }
}
