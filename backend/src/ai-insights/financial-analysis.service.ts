import { Injectable } from '@nestjs/common';
import {
  BudgetCategoryInput,
  BudgetHealthStatus,
  CategoryAnalysis,
  FinancialAlert,
  FinancialAnalysisInput,
  FinancialAnalysisResult,
  FinancialTransactionInput,
} from './interfaces/financial-analysis.interface';

@Injectable()
export class FinancialAnalysisService {
  analyze(input: FinancialAnalysisInput): FinancialAnalysisResult {
    this.validateInput(input);

    const allocatedBudget = this.toCents(input.allocatedBudget);
    const approvedIncome = this.sumTransactions(
      input.transactions,
      'INCOME',
      'APPROVED',
    );
    const pendingIncome = this.sumTransactions(
      input.transactions,
      'INCOME',
      'PENDING',
    );
    const approvedExpenses = this.sumTransactions(
      input.transactions,
      'EXPENSE',
      'APPROVED',
    );
    const pendingExpenses = this.sumTransactions(
      input.transactions,
      'EXPENSE',
      'PENDING',
    );
    const projectedExpenses = approvedExpenses + pendingExpenses;
    const remainingBudget = allocatedBudget - approvedExpenses;
    const projectedRemainingBudget = allocatedBudget - projectedExpenses;
    const utilizationPercentage = this.calculatePercentage(
      approvedExpenses,
      allocatedBudget,
    );
    const projectedUtilizationPercentage = this.calculatePercentage(
      projectedExpenses,
      allocatedBudget,
    );
    const budgetStatus = this.determineStatus(
      approvedExpenses,
      allocatedBudget,
    );
    const categoryBreakdown = this.analyzeCategories(
      input.budgetCategories ?? [],
      input.transactions,
    );

    return {
      metrics: {
        allocatedBudget: this.fromCents(allocatedBudget),
        approvedIncome: this.fromCents(approvedIncome),
        pendingIncome: this.fromCents(pendingIncome),
        approvedExpenses: this.fromCents(approvedExpenses),
        pendingExpenses: this.fromCents(pendingExpenses),
        remainingBudget: this.fromCents(remainingBudget),
        utilizationPercentage,
        projectedExpenses: this.fromCents(projectedExpenses),
        projectedRemainingBudget: this.fromCents(projectedRemainingBudget),
        projectedUtilizationPercentage,
        netCashFlow: this.fromCents(approvedIncome - approvedExpenses),
      },
      budgetStatus,
      categoryBreakdown,
      alerts: this.buildAlerts(
        allocatedBudget,
        approvedExpenses,
        projectedExpenses,
        utilizationPercentage,
        categoryBreakdown,
      ),
    };
  }

  private analyzeCategories(
    categories: BudgetCategoryInput[],
    transactions: FinancialTransactionInput[],
  ): CategoryAnalysis[] {
    return categories.map(({ category, allocatedBudget }) => {
      const allocation = this.toCents(allocatedBudget);
      const categoryTransactions = transactions.filter(
        (transaction) => transaction.category === category,
      );
      const approvedExpenses = this.sumTransactions(
        categoryTransactions,
        'EXPENSE',
        'APPROVED',
      );
      const pendingExpenses = this.sumTransactions(
        categoryTransactions,
        'EXPENSE',
        'PENDING',
      );
      const projectedExpenses = approvedExpenses + pendingExpenses;

      return {
        category,
        allocatedBudget: this.fromCents(allocation),
        approvedExpenses: this.fromCents(approvedExpenses),
        pendingExpenses: this.fromCents(pendingExpenses),
        remainingBudget: this.fromCents(allocation - approvedExpenses),
        utilizationPercentage: this.calculatePercentage(
          approvedExpenses,
          allocation,
        ),
        projectedRemainingBudget: this.fromCents(
          allocation - projectedExpenses,
        ),
        projectedUtilizationPercentage: this.calculatePercentage(
          projectedExpenses,
          allocation,
        ),
        status: this.determineStatus(approvedExpenses, allocation),
      };
    });
  }

  private buildAlerts(
    allocatedBudget: number,
    approvedExpenses: number,
    projectedExpenses: number,
    utilizationPercentage: number,
    categories: CategoryAnalysis[],
  ): FinancialAlert[] {
    const alerts: FinancialAlert[] = [];

    this.addBudgetAlerts(
      alerts,
      allocatedBudget,
      approvedExpenses,
      projectedExpenses,
      utilizationPercentage,
    );

    for (const category of categories) {
      const categoryAllocation = this.toCents(category.allocatedBudget);
      const categoryApproved = this.toCents(category.approvedExpenses);
      const categoryProjected =
        categoryApproved + this.toCents(category.pendingExpenses);

      this.addBudgetAlerts(
        alerts,
        categoryAllocation,
        categoryApproved,
        categoryProjected,
        category.utilizationPercentage,
        category.category,
      );
    }

    return alerts;
  }

  private addBudgetAlerts(
    alerts: FinancialAlert[],
    allocatedBudget: number,
    approvedExpenses: number,
    projectedExpenses: number,
    utilizationPercentage: number,
    category?: string,
  ): void {
    const subject = category ? `The ${category} category` : 'The event';

    if (approvedExpenses > allocatedBudget) {
      alerts.push({
        code: 'BUDGET_OVERSPENT',
        severity: 'critical',
        message: `${subject} has exceeded its allocated budget.`,
        ...(category ? { category } : {}),
      });
    } else if (allocatedBudget > 0 && approvedExpenses === allocatedBudget) {
      alerts.push({
        code: 'BUDGET_AT_LIMIT',
        severity: 'critical',
        message: `${subject} has used its entire allocated budget.`,
        ...(category ? { category } : {}),
      });
    } else if (allocatedBudget > 0 && utilizationPercentage >= 90) {
      alerts.push({
        code: 'BUDGET_NEAR_LIMIT',
        severity: 'warning',
        message: `${subject} has used at least 90% of its allocated budget.`,
        ...(category ? { category } : {}),
      });
    }

    if (
      approvedExpenses <= allocatedBudget &&
      projectedExpenses > allocatedBudget
    ) {
      alerts.push({
        code: 'PENDING_WOULD_EXCEED_BUDGET',
        severity: 'warning',
        message: `Approving all pending expenses for ${subject.toLowerCase()} would exceed its allocated budget.`,
        ...(category ? { category } : {}),
      });
    }
  }

  private determineStatus(
    approvedExpenses: number,
    allocatedBudget: number,
  ): BudgetHealthStatus {
    if (allocatedBudget === 0) {
      return approvedExpenses > 0 ? 'OVER_BUDGET' : 'NO_BUDGET';
    }

    const utilization = (approvedExpenses / allocatedBudget) * 100;

    if (utilization > 100) return 'OVER_BUDGET';
    if (utilization === 100) return 'AT_LIMIT';
    if (utilization >= 90) return 'WARNING';
    if (utilization >= 75) return 'WATCH';
    return 'SAFE';
  }

  private calculatePercentage(amount: number, total: number): number {
    if (total === 0) {
      return amount > 0 ? 100 : 0;
    }

    return this.round((amount / total) * 100);
  }

  private sumTransactions(
    transactions: FinancialTransactionInput[],
    type: FinancialTransactionInput['type'],
    status: FinancialTransactionInput['status'],
  ): number {
    return transactions
      .filter(
        (transaction) =>
          transaction.type === type && transaction.status === status,
      )
      .reduce(
        (total, transaction) => total + this.toCents(transaction.amount),
        0,
      );
  }

  private validateInput(input: FinancialAnalysisInput): void {
    this.assertValidAmount(input.allocatedBudget, 'allocatedBudget');

    input.budgetCategories?.forEach((category, index) => {
      if (!category.category.trim()) {
        throw new Error(
          `budgetCategories[${index}].category must not be empty`,
        );
      }
      this.assertValidAmount(
        category.allocatedBudget,
        `budgetCategories[${index}].allocatedBudget`,
      );
    });

    input.transactions.forEach((transaction, index) => {
      this.assertValidAmount(
        transaction.amount,
        `transactions[${index}].amount`,
      );
    });
  }

  private assertValidAmount(amount: number, field: string): void {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new RangeError(`${field} must be a finite, non-negative number`);
    }
  }

  private toCents(amount: number): number {
    return Math.round((amount + Number.EPSILON) * 100);
  }

  private fromCents(amount: number): number {
    return amount / 100;
  }

  private round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
