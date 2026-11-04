export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.10.13.62:5000/api';

export class ApiError extends Error {
  readonly status: number;

  /** `status` is the HTTP status, or 0 when the server could not be reached. */
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface EventSummary {
  id: string;
  title: string;
  code: string;
  status: string;
  date: string;
  venue?: string | null;
  /** The event's total budget. */
  allocated: number;
  totalAllocated: number;
  unallocated: number;
}

export interface CreateEventInput {
  title: string;
  startDate: string;
  totalBudget: number;
  venue?: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  description: string | null;
}

export interface BudgetItem {
  id: string;
  eventId: string;
  category: { id: string; name: string };
  itemName: string;
  quantity: number;
  unitPrice: number;
  allocatedAmount: number;
}

export interface BudgetItemInput {
  categoryId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
}

export type BudgetHealthStatus =
  | 'NO_BUDGET'
  | 'SAFE'
  | 'WATCH'
  | 'WARNING'
  | 'AT_LIMIT'
  | 'OVER_BUDGET';

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

export interface FinancialInsight {
  code: string;
  scope: 'EVENT' | 'CATEGORY';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  recommendation: string;
  category?: string;
}

export interface AiNarrative {
  source: 'gemini' | 'deterministic-fallback';
  model?: string;
  summary: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  keyFindings: string[];
  recommendations: string[];
  disclaimer: string;
}

export interface EventInsights {
  generatedAt: string;
  metrics: FinancialMetrics;
  budgetStatus: BudgetHealthStatus;
  categoryBreakdown: CategoryAnalysis[];
  insights: FinancialInsight[];
  aiNarrative: AiNarrative;
}

async function apiRequest<T>(
  path: string,
  token: string | null,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options.body !== undefined && { 'Content-Type': 'application/json' }),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Could not reach the FinFlow server. Check your connection and try again.');
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    // NestJS validation errors return `message` as an array of strings.
    const message = Array.isArray(data?.message) ? data.message.join(' ') : data?.message;
    throw new ApiError(response.status, message || `The request failed (${response.status}).`);
  }

  return response.json();
}

const budgetItemsPath = (eventId: string) => `/events/${encodeURIComponent(eventId)}/budget-items`;

export const listEvents = (token: string | null) => apiRequest<EventSummary[]>('/events', token);

export const getEvent = (token: string | null, eventId: string) =>
  apiRequest<EventSummary>(`/events/${encodeURIComponent(eventId)}`, token);

export const createEvent = (token: string | null, input: CreateEventInput) =>
  apiRequest<EventSummary>('/events', token, { method: 'POST', body: input });

export const getEventInsights = (token: string | null, eventId: string) =>
  apiRequest<EventInsights>(`/ai-insights/events/${encodeURIComponent(eventId)}`, token);

export const listBudgetCategories = (token: string | null) =>
  apiRequest<BudgetCategory[]>('/budget-categories', token);

export const listBudgetItems = (token: string | null, eventId: string) =>
  apiRequest<BudgetItem[]>(budgetItemsPath(eventId), token);

export const createBudgetItem = (token: string | null, eventId: string, input: BudgetItemInput) =>
  apiRequest<BudgetItem>(budgetItemsPath(eventId), token, { method: 'POST', body: input });

export const updateBudgetItem = (
  token: string | null,
  eventId: string,
  budgetItemId: string,
  input: BudgetItemInput,
) =>
  apiRequest<BudgetItem>(`${budgetItemsPath(eventId)}/${encodeURIComponent(budgetItemId)}`, token, {
    method: 'PATCH',
    body: input,
  });

export const deleteBudgetItem = (token: string | null, eventId: string, budgetItemId: string) =>
  apiRequest<{ id: string }>(`${budgetItemsPath(eventId)}/${encodeURIComponent(budgetItemId)}`, token, {
    method: 'DELETE',
  });
