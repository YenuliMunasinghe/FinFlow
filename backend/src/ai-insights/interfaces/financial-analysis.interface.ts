export type FinancialTransactionType = 'INCOME' | 'EXPENSE';

export type FinancialTransactionStatus =
  'APPROVED' | 'PENDING' | 'REJECTED' | 'REVISION_REQUESTED';

export type BudgetHealthStatus =
  'NO_BUDGET' | 'SAFE' | 'WATCH' | 'WARNING' | 'AT_LIMIT' | 'OVER_BUDGET';

export type FinancialAlertSeverity = 'info' | 'warning' | 'critical';

export type FinancialAlertCode =
  | 'BUDGET_NEAR_LIMIT'
  | 'BUDGET_AT_LIMIT'
  | 'BUDGET_OVERSPENT'
  | 'PENDING_WOULD_EXCEED_BUDGET';

export type FinancialInsightCode =
  | 'NO_BUDGET'
  | 'NO_SPENDING_ACTIVITY'
  | 'BUDGET_HEALTHY'
  | 'BUDGET_WATCH'
  | 'BUDGET_NEAR_LIMIT'
  | 'BUDGET_AT_LIMIT'
  | 'BUDGET_OVERSPENT'
  | 'PENDING_EXPENSE_RISK';

export type FinancialInsightScope = 'EVENT' | 'CATEGORY';

export interface FinancialTransactionInput {
  amount: number;
  type: FinancialTransactionType;
  status: FinancialTransactionStatus;
  category?: string;
}

export interface BudgetCategoryInput {
  category: string;
  allocatedBudget: number;
}

export interface FinancialAnalysisInput {
  allocatedBudget: number;
  transactions: FinancialTransactionInput[];
  budgetCategories?: BudgetCategoryInput[];
}

export interface FinancialMetrics {
  allocatedBudget: number;
  approvedIncome: number;
  pendingIncome: number;
  approvedExpenses: number;
  pendingExpenses: number;
  remainingBudget: number;
  utilizationPercentage: number;
  projectedExpenses: number;
  projectedRemainingBudget: number;
  projectedUtilizationPercentage: number;
  netCashFlow: number;
}

export interface CategoryAnalysis {
  category: string;
  allocatedBudget: number;
  approvedExpenses: number;
  pendingExpenses: number;
  remainingBudget: number;
  utilizationPercentage: number;
  projectedRemainingBudget: number;
  projectedUtilizationPercentage: number;
  status: BudgetHealthStatus;
}

export interface FinancialAlert {
  code: FinancialAlertCode;
  severity: FinancialAlertSeverity;
  message: string;
  category?: string;
}

export interface FinancialInsightEvidence {
  approvedExpenses: number;
  pendingExpenses: number;
  remainingBudget: number;
  projectedRemainingBudget: number;
  utilizationPercentage: number;
  projectedUtilizationPercentage: number;
}

export interface FinancialInsight {
  code: FinancialInsightCode;
  scope: FinancialInsightScope;
  severity: FinancialAlertSeverity;
  title: string;
  message: string;
  recommendation: string;
  evidence: FinancialInsightEvidence;
  category?: string;
}

export interface FinancialAnalysisResult {
  metrics: FinancialMetrics;
  budgetStatus: BudgetHealthStatus;
  categoryBreakdown: CategoryAnalysis[];
  alerts: FinancialAlert[];
}
