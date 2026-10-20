
import { Injectable } from '@nestjs/common';

@Injectable()
export class AiInsightsService {
  getDemoAnalysis() {
    // Synthetic data used only for initial development.
    const plannedBudget = 100000;
    const actualExpenses = 112000;

    const variance = actualExpenses - plannedBudget;
    const variancePercentage =
      (variance / plannedBudget) * 100;

    return {
      status: 'demo',
      plannedBudget,
      actualExpenses,
      variance,
      variancePercentage,
      budgetStatus:
        variance > 0 ? 'Over Budget' : 'Within Budget',
    };
  }
}

