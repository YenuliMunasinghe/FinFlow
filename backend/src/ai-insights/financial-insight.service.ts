import { Injectable } from '@nestjs/common';
import {
  BudgetHealthStatus,
  FinancialAnalysisResult,
  FinancialInsight,
  FinancialInsightEvidence,
  FinancialInsightScope,
} from './interfaces/financial-analysis.interface';

interface InsightSituation {
  scope: FinancialInsightScope;
  status: BudgetHealthStatus;
  allocatedBudget: number;
  evidence: FinancialInsightEvidence;
  category?: string;
}

@Injectable()
export class FinancialInsightService {
  generate(analysis: FinancialAnalysisResult): FinancialInsight[] {
    const insights = this.generateForSituation({
      scope: 'EVENT',
      status: analysis.budgetStatus,
      allocatedBudget: analysis.metrics.allocatedBudget,
      evidence: this.toEvidence(analysis.metrics),
    });

    for (const category of analysis.categoryBreakdown) {
      insights.push(
        ...this.generateForSituation({
          scope: 'CATEGORY',
          category: category.category,
          status: category.status,
          allocatedBudget: category.allocatedBudget,
          evidence: this.toEvidence(category),
        }),
      );
    }

    return insights;
  }

  private generateForSituation(
    situation: InsightSituation,
  ): FinancialInsight[] {
    const { evidence } = situation;
    const subject = situation.category
      ? `${situation.category} category`
      : 'Event budget';
    const context = situation.category ? { category: situation.category } : {};
    const insights: FinancialInsight[] = [];

    if (situation.allocatedBudget === 0 && evidence.approvedExpenses === 0) {
      insights.push({
        code: 'NO_BUDGET',
        scope: situation.scope,
        severity: 'warning',
        title: `${subject} has no allocation`,
        message: `${subject} cannot be evaluated because no budget has been allocated.`,
        recommendation:
          'Set an approved budget before evaluating or approving expenses.',
        evidence,
        ...context,
      });
    } else if (
      evidence.approvedExpenses === 0 &&
      evidence.pendingExpenses === 0
    ) {
      insights.push({
        code: 'NO_SPENDING_ACTIVITY',
        scope: situation.scope,
        severity: 'info',
        title: `${subject} has no spending activity`,
        message: `${subject} has no approved or pending expenses yet.`,
        recommendation:
          'Continue monitoring as transactions are submitted and approved.',
        evidence,
        ...context,
      });
    } else {
      insights.push(this.createStatusInsight(situation, subject));
    }

    if (
      evidence.remainingBudget >= 0 &&
      evidence.projectedRemainingBudget < 0
    ) {
      insights.push({
        code: 'PENDING_EXPENSE_RISK',
        scope: situation.scope,
        severity: 'warning',
        title: `Pending expenses put ${subject.toLowerCase()} at risk`,
        message: `Approving every pending expense would push ${subject.toLowerCase()} over budget.`,
        recommendation:
          'Review, reduce, reject, or reallocate pending expenses before approval.',
        evidence,
        ...context,
      });
    }

    return insights;
  }

  private createStatusInsight(
    situation: InsightSituation,
    subject: string,
  ): FinancialInsight {
    const base = {
      scope: situation.scope,
      evidence: situation.evidence,
      ...(situation.category ? { category: situation.category } : {}),
    };

    switch (situation.status) {
      case 'SAFE':
        return {
          ...base,
          code: 'BUDGET_HEALTHY',
          severity: 'info',
          title: `${subject} is healthy`,
          message: `${subject} is using less than 75% of its allocation.`,
          recommendation:
            'Continue monitoring approved and pending expenses against the plan.',
        };
      case 'WATCH':
        return {
          ...base,
          code: 'BUDGET_WATCH',
          severity: 'warning',
          title: `${subject} requires monitoring`,
          message: `${subject} has used at least 75% of its allocation.`,
          recommendation:
            'Review remaining planned costs before approving additional spending.',
        };
      case 'WARNING':
        return {
          ...base,
          code: 'BUDGET_NEAR_LIMIT',
          severity: 'warning',
          title: `${subject} is near its limit`,
          message: `${subject} has used at least 90% of its allocation.`,
          recommendation:
            'Prioritize essential expenses and review the remaining allocation.',
        };
      case 'AT_LIMIT':
        return {
          ...base,
          code: 'BUDGET_AT_LIMIT',
          severity: 'critical',
          title: `${subject} is fully utilized`,
          message: `${subject} has used its entire allocation.`,
          recommendation:
            'Do not approve additional expenses without an approved budget adjustment.',
        };
      case 'OVER_BUDGET':
        return {
          ...base,
          code: 'BUDGET_OVERSPENT',
          severity: 'critical',
          title: `${subject} is over budget`,
          message:
            situation.allocatedBudget === 0
              ? `${subject} has approved spending without an allocated budget.`
              : `${subject} has exceeded its allocation.`,
          recommendation:
            'Review the overspend and obtain an approved reallocation or corrective action.',
        };
      case 'NO_BUDGET':
        return {
          ...base,
          code: 'NO_BUDGET',
          severity: 'warning',
          title: `${subject} has no allocation`,
          message: `${subject} has no budget available for analysis.`,
          recommendation:
            'Set an approved budget before evaluating or approving expenses.',
        };
    }
  }

  private toEvidence(metrics: {
    approvedExpenses: number;
    pendingExpenses: number;
    remainingBudget: number;
    projectedRemainingBudget: number;
    utilizationPercentage: number;
    projectedUtilizationPercentage: number;
  }): FinancialInsightEvidence {
    return {
      approvedExpenses: metrics.approvedExpenses,
      pendingExpenses: metrics.pendingExpenses,
      remainingBudget: metrics.remainingBudget,
      projectedRemainingBudget: metrics.projectedRemainingBudget,
      utilizationPercentage: metrics.utilizationPercentage,
      projectedUtilizationPercentage: metrics.projectedUtilizationPercentage,
    };
  }
}
