import { FinancialAnalysisService } from './financial-analysis.service';
import { FinancialInsightService } from './financial-insight.service';

describe('FinancialInsightService', () => {
  let calculator: FinancialAnalysisService;
  let service: FinancialInsightService;

  beforeEach(() => {
    calculator = new FinancialAnalysisService();
    service = new FinancialInsightService();
  });

  it.each([
    {
      name: 'no budget',
      budget: 0,
      approved: 0,
      expectedCode: 'NO_BUDGET',
    },
    {
      name: 'no activity',
      budget: 100000,
      approved: 0,
      expectedCode: 'NO_SPENDING_ACTIVITY',
    },
    {
      name: 'healthy',
      budget: 100000,
      approved: 50000,
      expectedCode: 'BUDGET_HEALTHY',
    },
    {
      name: 'watch',
      budget: 100000,
      approved: 80000,
      expectedCode: 'BUDGET_WATCH',
    },
    {
      name: 'near limit',
      budget: 100000,
      approved: 95000,
      expectedCode: 'BUDGET_NEAR_LIMIT',
    },
    {
      name: 'at limit',
      budget: 100000,
      approved: 100000,
      expectedCode: 'BUDGET_AT_LIMIT',
    },
    {
      name: 'over budget',
      budget: 100000,
      approved: 110000,
      expectedCode: 'BUDGET_OVERSPENT',
    },
  ])(
    'creates the $name event insight',
    ({ budget, approved, expectedCode }) => {
      const analysis = calculator.analyze({
        allocatedBudget: budget,
        transactions:
          approved === 0
            ? []
            : [{ amount: approved, type: 'EXPENSE', status: 'APPROVED' }],
      });

      expect(service.generate(analysis)[0]).toEqual(
        expect.objectContaining({
          code: expectedCode,
          scope: 'EVENT',
          evidence: expect.objectContaining({ approvedExpenses: approved }),
        }),
      );
    },
  );

  it('adds a projected-risk insight when pending expenses exceed the remainder', () => {
    const analysis = calculator.analyze({
      allocatedBudget: 100000,
      transactions: [
        { amount: 80000, type: 'EXPENSE', status: 'APPROVED' },
        { amount: 25000, type: 'EXPENSE', status: 'PENDING' },
      ],
    });

    expect(service.generate(analysis)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'PENDING_EXPENSE_RISK',
          scope: 'EVENT',
          evidence: expect.objectContaining({
            remainingBudget: 20000,
            projectedRemainingBudget: -5000,
          }),
        }),
      ]),
    );
  });

  it('generates category-specific situations from category calculations', () => {
    const analysis = calculator.analyze({
      allocatedBudget: 100000,
      budgetCategories: [
        { category: 'Catering', allocatedBudget: 50000 },
        { category: 'Venue', allocatedBudget: 50000 },
      ],
      transactions: [
        {
          amount: 48000,
          type: 'EXPENSE',
          status: 'APPROVED',
          category: 'Catering',
        },
      ],
    });

    const insights = service.generate(analysis);

    expect(insights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'BUDGET_NEAR_LIMIT',
          scope: 'CATEGORY',
          category: 'Catering',
        }),
        expect.objectContaining({
          code: 'NO_SPENDING_ACTIVITY',
          scope: 'CATEGORY',
          category: 'Venue',
        }),
      ]),
    );
  });
});
