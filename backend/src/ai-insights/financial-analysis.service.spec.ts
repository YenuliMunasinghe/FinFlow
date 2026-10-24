import { FinancialAnalysisService } from './financial-analysis.service';

describe('FinancialAnalysisService', () => {
  let service: FinancialAnalysisService;

  beforeEach(() => {
    service = new FinancialAnalysisService();
  });

  it('calculates approved, pending, projected, and cash-flow metrics', () => {
    const result = service.analyze({
      allocatedBudget: 100000,
      transactions: [
        { amount: 25000, type: 'INCOME', status: 'APPROVED' },
        { amount: 5000, type: 'INCOME', status: 'PENDING' },
        { amount: 70000, type: 'EXPENSE', status: 'APPROVED' },
        { amount: 15000, type: 'EXPENSE', status: 'PENDING' },
        { amount: 9000, type: 'EXPENSE', status: 'REJECTED' },
      ],
    });

    expect(result.metrics).toEqual({
      allocatedBudget: 100000,
      approvedIncome: 25000,
      pendingIncome: 5000,
      approvedExpenses: 70000,
      pendingExpenses: 15000,
      remainingBudget: 30000,
      utilizationPercentage: 70,
      projectedExpenses: 85000,
      projectedRemainingBudget: 15000,
      projectedUtilizationPercentage: 85,
      netCashFlow: -45000,
    });
    expect(result.budgetStatus).toBe('SAFE');
    expect(result.alerts).toEqual([]);
  });

  it('warns when approved spending is near the budget limit', () => {
    const result = service.analyze({
      allocatedBudget: 100000,
      transactions: [{ amount: 92000, type: 'EXPENSE', status: 'APPROVED' }],
    });

    expect(result.budgetStatus).toBe('WARNING');
    expect(result.alerts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'BUDGET_NEAR_LIMIT',
          severity: 'warning',
        }),
      ]),
    );
  });

  it('reports overspending and preserves a negative remaining balance', () => {
    const result = service.analyze({
      allocatedBudget: 100000,
      transactions: [{ amount: 112000, type: 'EXPENSE', status: 'APPROVED' }],
    });

    expect(result.budgetStatus).toBe('OVER_BUDGET');
    expect(result.metrics.remainingBudget).toBe(-12000);
    expect(result.metrics.utilizationPercentage).toBe(112);
    expect(result.alerts[0]).toEqual(
      expect.objectContaining({
        code: 'BUDGET_OVERSPENT',
        severity: 'critical',
      }),
    );
  });

  it('warns when pending expenses would push spending over budget', () => {
    const result = service.analyze({
      allocatedBudget: 100000,
      transactions: [
        { amount: 80000, type: 'EXPENSE', status: 'APPROVED' },
        { amount: 25000, type: 'EXPENSE', status: 'PENDING' },
      ],
    });

    expect(result.metrics.projectedRemainingBudget).toBe(-5000);
    expect(result.alerts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'PENDING_WOULD_EXCEED_BUDGET' }),
      ]),
    );
  });

  it('handles zero budgets without division errors', () => {
    const empty = service.analyze({ allocatedBudget: 0, transactions: [] });
    const spent = service.analyze({
      allocatedBudget: 0,
      transactions: [{ amount: 1000, type: 'EXPENSE', status: 'APPROVED' }],
    });

    expect(empty.budgetStatus).toBe('NO_BUDGET');
    expect(empty.metrics.utilizationPercentage).toBe(0);
    expect(spent.budgetStatus).toBe('OVER_BUDGET');
    expect(spent.metrics.utilizationPercentage).toBe(100);
  });

  it('calculates category utilization and category-specific alerts', () => {
    const result = service.analyze({
      allocatedBudget: 150000,
      budgetCategories: [
        { category: 'Catering', allocatedBudget: 50000 },
        { category: 'Venue', allocatedBudget: 100000 },
      ],
      transactions: [
        {
          amount: 47000,
          type: 'EXPENSE',
          status: 'APPROVED',
          category: 'Catering',
        },
        {
          amount: 5000,
          type: 'EXPENSE',
          status: 'PENDING',
          category: 'Catering',
        },
        {
          amount: 40000,
          type: 'EXPENSE',
          status: 'APPROVED',
          category: 'Venue',
        },
      ],
    });

    expect(result.categoryBreakdown[0]).toEqual(
      expect.objectContaining({
        category: 'Catering',
        utilizationPercentage: 94,
        projectedRemainingBudget: -2000,
        status: 'WARNING',
      }),
    );
    expect(result.alerts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'BUDGET_NEAR_LIMIT',
          category: 'Catering',
        }),
        expect.objectContaining({
          code: 'PENDING_WOULD_EXCEED_BUDGET',
          category: 'Catering',
        }),
      ]),
    );
  });

  it('uses cent-based arithmetic for decimal amounts', () => {
    const result = service.analyze({
      allocatedBudget: 1,
      transactions: [
        { amount: 0.1, type: 'EXPENSE', status: 'APPROVED' },
        { amount: 0.2, type: 'EXPENSE', status: 'APPROVED' },
      ],
    });

    expect(result.metrics.approvedExpenses).toBe(0.3);
    expect(result.metrics.remainingBudget).toBe(0.7);
    expect(result.metrics.utilizationPercentage).toBe(30);
  });

  it('rejects negative or non-finite monetary input', () => {
    expect(() =>
      service.analyze({ allocatedBudget: -1, transactions: [] }),
    ).toThrow(RangeError);
    expect(() =>
      service.analyze({
        allocatedBudget: 100,
        transactions: [
          { amount: Number.NaN, type: 'EXPENSE', status: 'APPROVED' },
        ],
      }),
    ).toThrow(RangeError);
  });
});
