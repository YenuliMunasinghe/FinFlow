/**
 * Realistic event-finance scenario shared by the database seed and the
 * real-database e2e test. The EXPECTED_* values are hand-calculated from the
 * data below and act as the source of truth the insight endpoint must match.
 *
 * Scenario summary (LKR):
 *   Event budget 450,000 · allocated 435,000 · unallocated 15,000
 *   Venue & Equipment     210,000  approved 208,000 + 6,500 pending  -> WARNING, pending would overrun
 *   Food & Beverage       165,000  approved 120,000 + 28,000 pending -> SAFE
 *   Printing & Marketing   35,000  approved 39,500                   -> OVER_BUDGET
 *   Transport & Logistics  25,000  no spending                       -> no activity
 *   Rejected and revision-requested transactions are recorded but must be ignored.
 */

export const BUDGET_CATEGORIES = [
  { name: 'Food & Beverage', description: 'Catering, snacks, drinks, and meals' },
  { name: 'Transport & Logistics', description: 'Vehicle rentals, fuel, travel, and logistics' },
  { name: 'Venue & Equipment', description: 'Hall bookings, sound systems, lights, and staging' },
  { name: 'Printing & Marketing', description: 'Banners, flyers, posters, and promotional merchandise' },
  { name: 'Miscellaneous', description: 'Uncategorized or emergency event expenses' },
] as const;

export type CategoryName = (typeof BUDGET_CATEGORIES)[number]['name'];

export const DEMO_EVENT = {
  title: 'Annual Tech Symposium 2026',
  venue: 'Main University Auditorium',
  description: 'Flagship annual symposium with industry talks and workshops.',
  startDate: '2026-12-10',
  endDate: '2026-12-11',
  totalBudget: 450000,
};

export interface FixtureBudgetItem {
  key: string;
  category: CategoryName;
  itemName: string;
  quantity: number;
  unitPrice: number;
}

export const DEMO_BUDGET_ITEMS: FixtureBudgetItem[] = [
  { key: 'hall', category: 'Venue & Equipment', itemName: 'Main auditorium hire (2 days)', quantity: 1, unitPrice: 150000 },
  { key: 'sound', category: 'Venue & Equipment', itemName: 'Sound & lighting package', quantity: 1, unitPrice: 60000 },
  { key: 'lunch', category: 'Food & Beverage', itemName: 'Delegate lunch packs', quantity: 300, unitPrice: 450 },
  { key: 'tea', category: 'Food & Beverage', itemName: 'Tea & refreshments', quantity: 300, unitPrice: 100 },
  { key: 'banners', category: 'Printing & Marketing', itemName: 'Event banners', quantity: 4, unitPrice: 5000 },
  { key: 'certs', category: 'Printing & Marketing', itemName: 'Participation certificates', quantity: 300, unitPrice: 50 },
  { key: 'bus', category: 'Transport & Logistics', itemName: 'Speaker shuttle bus hire', quantity: 2, unitPrice: 12500 },
];

export const DEMO_TOTAL_ALLOCATED = 435000;

export type FixtureStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'REVISION_REQUESTED';

export interface FixtureTransaction {
  key: string;
  title: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  /** Budget item key (expenses only). */
  item?: string;
  /** Status after the President has reviewed it. */
  finalStatus: FixtureStatus;
  /** Present when the submission exceeds a budget limit. */
  justification?: string;
  /** Expected `isOverBudget` after the full submit/review workflow. */
  overBudget: boolean;
  reviewNote?: string;
}

/**
 * Listed in submission order. Over-budget flags assume every transaction is
 * submitted first (approved + pending count at submission) and then reviewed
 * in this order (approval re-checks against approved expenses only).
 */
export const DEMO_TRANSACTIONS: FixtureTransaction[] = [
  { key: 'hall', title: 'Auditorium hire – full payment', type: 'EXPENSE', amount: 150000, item: 'hall', finalStatus: 'APPROVED', overBudget: false },
  { key: 'sound', title: 'Sound & lighting vendor invoice', type: 'EXPENSE', amount: 58000, item: 'sound', finalStatus: 'APPROVED', overBudget: false },
  {
    key: 'soundExtra', title: 'Additional wireless microphones', type: 'EXPENSE', amount: 6500, item: 'sound', finalStatus: 'PENDING', overBudget: true,
    justification: 'Two extra panel sessions were added and need four more microphones.',
  },
  {
    key: 'dj', title: 'DJ for closing social', type: 'EXPENSE', amount: 40000, item: 'sound', finalStatus: 'REJECTED', overBudget: true,
    justification: 'Requested by the social committee for the closing night.', reviewNote: 'Not part of the approved event plan.',
  },
  { key: 'lunch', title: 'Lunch packs – caterer invoice', type: 'EXPENSE', amount: 120000, item: 'lunch', finalStatus: 'APPROVED', overBudget: false },
  { key: 'tea', title: 'Tea & refreshments – caterer invoice', type: 'EXPENSE', amount: 28000, item: 'tea', finalStatus: 'PENDING', overBudget: false },
  {
    key: 'banners', title: 'Large-format banners (reprint)', type: 'EXPENSE', amount: 26000, item: 'banners', finalStatus: 'APPROVED', overBudget: true,
    justification: 'Sponsor logos changed after the first print run; banners had to be reprinted.',
  },
  { key: 'certs', title: 'Certificate printing', type: 'EXPENSE', amount: 13500, item: 'certs', finalStatus: 'APPROVED', overBudget: false },
  {
    key: 'flyers', title: 'Promotional flyers', type: 'EXPENSE', amount: 8000, item: 'banners', finalStatus: 'REVISION_REQUESTED', overBudget: true,
    justification: 'Extra flyers for the schools outreach programme.', reviewNote: 'Attach the printer quotation and reduce the quantity.',
  },
  { key: 'sponsor', title: 'Gold sponsorship deposit', type: 'INCOME', amount: 200000, finalStatus: 'APPROVED', overBudget: false },
  { key: 'tickets', title: 'Delegate ticket sales', type: 'INCOME', amount: 45000, finalStatus: 'PENDING', overBudget: false },
  { key: 'stall', title: 'Stall rental (cancelled vendor)', type: 'INCOME', amount: 10000, finalStatus: 'REJECTED', overBudget: false, reviewNote: 'Vendor withdrew.' },
];

export const EXPECTED_METRICS = {
  allocatedBudget: 450000,
  approvedIncome: 200000,
  pendingIncome: 45000,
  approvedExpenses: 367500,
  pendingExpenses: 34500,
  remainingBudget: 82500,
  utilizationPercentage: 81.67,
  projectedExpenses: 402000,
  projectedRemainingBudget: 48000,
  projectedUtilizationPercentage: 89.33,
  netCashFlow: -167500,
};

export const EXPECTED_BUDGET_STATUS = 'WATCH';
export const EXPECTED_RISK_LEVEL = 'MEDIUM';

export const EXPECTED_CATEGORIES = [
  {
    category: 'Venue & Equipment', allocatedBudget: 210000, approvedExpenses: 208000, pendingExpenses: 6500,
    remainingBudget: 2000, utilizationPercentage: 99.05, projectedRemainingBudget: -4500,
    projectedUtilizationPercentage: 102.14, status: 'WARNING',
  },
  {
    category: 'Food & Beverage', allocatedBudget: 165000, approvedExpenses: 120000, pendingExpenses: 28000,
    remainingBudget: 45000, utilizationPercentage: 72.73, projectedRemainingBudget: 17000,
    projectedUtilizationPercentage: 89.7, status: 'SAFE',
  },
  {
    category: 'Printing & Marketing', allocatedBudget: 35000, approvedExpenses: 39500, pendingExpenses: 0,
    remainingBudget: -4500, utilizationPercentage: 112.86, projectedRemainingBudget: -4500,
    projectedUtilizationPercentage: 112.86, status: 'OVER_BUDGET',
  },
  {
    category: 'Transport & Logistics', allocatedBudget: 25000, approvedExpenses: 0, pendingExpenses: 0,
    remainingBudget: 25000, utilizationPercentage: 0, projectedRemainingBudget: 25000,
    projectedUtilizationPercentage: 0, status: 'SAFE',
  },
];

/** [code, category | undefined] pairs, order-independent. */
export const EXPECTED_ALERTS: Array<[string, string | undefined]> = [
  ['BUDGET_NEAR_LIMIT', 'Venue & Equipment'],
  ['PENDING_WOULD_EXCEED_BUDGET', 'Venue & Equipment'],
  ['BUDGET_OVERSPENT', 'Printing & Marketing'],
];

/** [code, category | undefined] pairs, order-independent. */
export const EXPECTED_INSIGHTS: Array<[string, string | undefined]> = [
  ['BUDGET_WATCH', undefined],
  ['BUDGET_NEAR_LIMIT', 'Venue & Equipment'],
  ['PENDING_EXPENSE_RISK', 'Venue & Equipment'],
  ['BUDGET_HEALTHY', 'Food & Beverage'],
  ['BUDGET_OVERSPENT', 'Printing & Marketing'],
  ['NO_SPENDING_ACTIVITY', 'Transport & Logistics'],
];
