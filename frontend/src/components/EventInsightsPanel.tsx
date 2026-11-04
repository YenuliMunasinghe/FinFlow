'use client';

import React, { useEffect, useState } from 'react';
import {
  CircleAlert,
  CircleMinus,
  CircleX,
  Eye,
  Info,
  LucideIcon,
  OctagonAlert,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  AiNarrative,
  ApiError,
  BudgetHealthStatus,
  CategoryAnalysis,
  EventInsights,
  FinancialInsight,
  getEventInsights,
} from '@/lib/api';
import { formatMoney } from '@/lib/format';

interface EventInsightsPanelProps {
  eventId: string;
  /** The event's data changed after these insights were generated. */
  isStale: boolean;
  onRefreshStart: () => void;
}

const STATUS_DISPLAY: Record<BudgetHealthStatus, { label: string; icon: LucideIcon; className: string }> = {
  SAFE: { label: 'Safe', icon: ShieldCheck, className: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  WATCH: { label: 'Watch', icon: Eye, className: 'bg-amber-50 border-amber-200 text-amber-800' },
  WARNING: { label: 'Near Limit', icon: TriangleAlert, className: 'bg-orange-50 border-orange-200 text-orange-800' },
  AT_LIMIT: { label: 'At Limit', icon: OctagonAlert, className: 'bg-rose-50 border-rose-200 text-rose-800' },
  OVER_BUDGET: { label: 'Over Budget', icon: CircleX, className: 'bg-rose-100 border-rose-300 text-rose-900' },
  NO_BUDGET: { label: 'No Budget', icon: CircleMinus, className: 'bg-slate-100 border-slate-200 text-slate-700' },
};

const RISK_LABEL: Record<AiNarrative['riskLevel'], string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export default function EventInsightsPanel({ eventId, isStale, onRefreshStart }: EventInsightsPanelProps) {
  const { token, logout } = useAuth();
  const [insights, setInsights] = useState<EventInsights | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    let isCurrent = true;

    getEventInsights(token, eventId)
      .then((result) => {
        if (!isCurrent) return;
        setInsights(result);
        setError(null);
        setIsFetching(false);
      })
      .catch((err: Error) => {
        if (!isCurrent) return;
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setError(err);
        setIsFetching(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [token, eventId, logout, reloadCount]);

  const handleRefresh = () => {
    setIsFetching(true);
    setError(null);
    onRefreshStart();
    setReloadCount((count) => count + 1);
  };

  return (
    <section
      aria-labelledby="event-insights-heading"
      aria-busy={isFetching}
      className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
    >
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
        <div>
          <h2 id="event-insights-heading" className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Financial Insights</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {insights
              ? `Generated ${new Date(insights.generatedAt).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}`
              : 'Budget health and guidance from this event’s recorded transactions.'}
          </p>
        </div>

        {(insights || !isFetching) && !isHiddenError(error) && (
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="self-start sm:self-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:hover:bg-slate-100"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Generating...' : insights ? 'Refresh' : 'Try Again'}</span>
          </button>
        )}
      </div>

      {isStale && !isFetching && (
        <p className="px-5 py-3 bg-amber-50 border-b border-amber-100 text-xs text-amber-800">
          The budget changed after these insights were generated. Refresh to update them.
        </p>
      )}

      {error && insights && (
        <p role="alert" className="px-5 py-3 bg-rose-50 border-b border-rose-100 text-xs text-rose-800">
          These insights could not be refreshed, so the previous results are still shown. {error.message}
        </p>
      )}

      {insights ? (
        <InsightsContent insights={insights} />
      ) : isFetching ? (
        <InsightsLoading />
      ) : (
        <InsightsError error={error} />
      )}
    </section>
  );
}

/** Retrying cannot fix a missing event or a lack of access. */
function isHiddenError(error: Error | null) {
  return error instanceof ApiError && (error.status === 403 || error.status === 404);
}

function InsightsLoading() {
  return (
    <div role="status" className="p-5 space-y-4">
      <p className="text-xs text-slate-500 font-medium">Analysing this event’s finances. This can take a few seconds...</p>
      <div className="animate-pulse space-y-4" aria-hidden="true">
        <div className="h-20 rounded-xl bg-slate-100" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="h-16 rounded-xl bg-slate-100" />
          ))}
        </div>
        <div className="h-32 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

function InsightsError({ error }: { error: Error | null }) {
  const status = error instanceof ApiError ? error.status : undefined;
  const heading =
    status === 403
      ? 'You don’t have access to these insights'
      : status === 404
        ? 'This event no longer exists'
        : 'Insights could not be loaded';

  return (
    <div className="px-6 py-10 text-center">
      <CircleAlert className="w-6 h-6 text-amber-500 mx-auto" />
      <p className="text-sm font-semibold text-slate-800 mt-3">{heading}</p>
      {error && <p className="text-xs text-slate-500 mt-1">{error.message}</p>}
    </div>
  );
}

function InsightsContent({ insights }: { insights: EventInsights }) {
  const { metrics, budgetStatus, categoryBreakdown, aiNarrative } = insights;

  return (
    <div className="p-5 space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={budgetStatus} />
        <span className="text-xs font-semibold text-slate-600">
          Risk level: <span className="text-slate-900">{RISK_LABEL[aiNarrative.riskLevel]}</span>
        </span>
      </div>

      <NarrativeCard narrative={aiNarrative} />

      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="text-xs font-bold text-slate-900">Budget Used</h3>
          <span className="font-mono text-xs text-slate-700">
            {metrics.utilizationPercentage}% approved · {metrics.projectedUtilizationPercentage}% after pending
          </span>
        </div>
        <UsageMeter
          approvedPct={metrics.utilizationPercentage}
          projectedPct={metrics.projectedUtilizationPercentage}
          label="Event budget used"
          heightClass="h-3"
        />
        <MeterLegend />
      </div>

      <dl className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-3">
        <Figure label="Event Budget" value={metrics.allocatedBudget} />
        <Figure label="Approved Expenses" value={metrics.approvedExpenses} />
        <Figure label="Pending Expenses" value={metrics.pendingExpenses} />
        <Figure label="Remaining Budget" value={metrics.remainingBudget} />
        <Figure label="Remaining After Pending" value={metrics.projectedRemainingBudget} />
        <Figure label="Approved Income" value={metrics.approvedIncome} />
        <Figure label="Pending Income" value={metrics.pendingIncome} />
        <Figure label="Net Cash Flow" value={metrics.netCashFlow} note="Approved income minus approved expenses" />
      </dl>

      <WarningsList insights={insights.insights} />
      <CategoryTable categories={categoryBreakdown} />
    </div>
  );
}

function StatusBadge({ status }: { status: BudgetHealthStatus }) {
  const { label, icon: Icon, className } = STATUS_DISPLAY[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold whitespace-nowrap ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </span>
  );
}

function NarrativeCard({ narrative }: { narrative: AiNarrative }) {
  // The fallback only restates the calculated sections below, so it isn't repeated here.
  if (narrative.source !== 'gemini') {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex gap-2.5 text-xs text-slate-700">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-px" />
        <p>
          <strong className="font-bold text-slate-900">The AI summary is unavailable right now.</strong> The figures and
          warnings below are FinFlow’s own calculations and aren’t affected. Use Refresh to try the summary again.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-3 text-xs text-slate-700">
      <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
        <span>AI Summary</span>
      </h3>
      <p className="text-sm leading-relaxed text-slate-800">{narrative.summary}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NarrativeList title="Key Findings" entries={narrative.keyFindings} />
        <NarrativeList title="Recommendations" entries={narrative.recommendations} />
      </div>

      <p className="pt-3 border-t border-blue-100 text-[11px] text-slate-500">{narrative.disclaimer}</p>
    </div>
  );
}

function NarrativeList({ title, entries }: { title: string; entries: string[] }) {
  if (entries.length === 0) return null;

  return (
    <div>
      <h4 className="font-bold text-slate-900 mb-1.5">{title}</h4>
      <ul className="list-disc pl-4 space-y-1">
        {entries.map((entry, index) => (
          <li key={index}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}

function Figure({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3.5 min-w-0">
      <dt className="text-[11px] font-semibold text-slate-500">{label}</dt>
      <dd className={`font-mono text-sm font-bold mt-1 break-words ${value < 0 ? 'text-rose-700' : 'text-slate-900'}`}>
        {formatMoney(value)}
      </dd>
      {note && <dd className="text-[11px] text-slate-500 mt-1">{note}</dd>}
    </div>
  );
}

/**
 * Approved and pending spending against the budget. The scale grows past 100%
 * when spending does, with a marker showing where the budget ends.
 */
function UsageMeter({
  approvedPct,
  projectedPct,
  label,
  heightClass = 'h-2',
}: {
  approvedPct: number;
  projectedPct: number;
  label: string;
  heightClass?: string;
}) {
  const scale = Math.max(100, projectedPct);
  const pendingPct = Math.max(0, projectedPct - approvedPct);
  const description = `${label}: ${approvedPct}% approved, ${projectedPct}% after pending`;

  return (
    <div role="img" aria-label={description} title={description} className={`relative w-full ${heightClass} rounded-full bg-slate-100 overflow-hidden flex gap-0.5`}>
      {approvedPct > 0 && <div className="bg-blue-600" style={{ width: `${(approvedPct / scale) * 100}%` }} />}
      {pendingPct > 0 && <div className="bg-blue-400" style={{ width: `${(pendingPct / scale) * 100}%` }} />}
      {scale > 100 && (
        <div
          className="absolute inset-y-0 w-0.5 bg-slate-900 ring-1 ring-white"
          style={{ left: `${(100 / scale) * 100}%` }}
        />
      )}
    </div>
  );
}

function MeterLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600">
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
        <span>Approved</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-sm bg-blue-400" />
        <span>Pending</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-0.5 h-3 bg-slate-900" />
        <span>Budget limit, when exceeded</span>
      </span>
    </div>
  );
}

const SEVERITY_ORDER: Record<FinancialInsight['severity'], number> = { critical: 0, warning: 1, info: 2 };

function WarningsList({ insights }: { insights: FinancialInsight[] }) {
  const warnings = insights
    .filter((insight) => insight.severity !== 'info')
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  const eventMessage = insights.find((insight) => insight.scope === 'EVENT')?.message;

  return (
    <div>
      <h3 className="text-xs font-bold text-slate-900 mb-2">Warnings & Actions</h3>
      {warnings.length === 0 ? (
        <p className="rounded-xl border border-slate-200 p-3.5 text-xs text-slate-600">
          No budget warnings right now.{eventMessage ? ` ${eventMessage}` : ''}
        </p>
      ) : (
        <ul className="space-y-2">
          {warnings.map((insight) => {
            const isCritical = insight.severity === 'critical';
            const Icon = isCritical ? OctagonAlert : TriangleAlert;
            return (
              <li
                key={`${insight.code}-${insight.category ?? 'event'}`}
                className={`rounded-xl border p-3.5 flex gap-2.5 text-xs ${
                  isCritical ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 mt-px ${isCritical ? 'text-rose-600' : 'text-amber-600'}`} />
                <div className="space-y-1 text-slate-700 min-w-0">
                  <p className="font-bold text-slate-900">
                    <span className="sr-only">{isCritical ? 'Critical: ' : 'Warning: '}</span>
                    {insight.title}
                  </p>
                  <p>{insight.message}</p>
                  <p>
                    <strong className="font-semibold text-slate-900">Action:</strong> {insight.recommendation}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function CategoryTable({ categories }: { categories: CategoryAnalysis[] }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-slate-900 mb-2">Category Analysis</h3>
      {categories.length === 0 ? (
        <p className="rounded-xl border border-slate-200 p-3.5 text-xs text-slate-600">
          No categories to analyse yet. Add budget items to see spending by category.
        </p>
      ) : (
        <div className="space-y-2">
          <div className="relative overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[820px] text-xs">
              <thead>
                <tr className="bg-slate-50 text-left text-[11px] font-bold text-slate-500">
                  <th scope="col" className="px-3.5 py-2.5">Category</th>
                  <th scope="col" className="px-3 py-2.5">Status</th>
                  <th scope="col" className="px-3 py-2.5 text-right">Budget</th>
                  <th scope="col" className="px-3 py-2.5 text-right">Approved</th>
                  <th scope="col" className="px-3 py-2.5 text-right">Pending</th>
                  <th scope="col" className="px-3 py-2.5 text-right">After Pending</th>
                  <th scope="col" className="px-3.5 py-2.5 w-44">Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((category) => (
                  <tr key={category.category}>
                    <th scope="row" className="px-3.5 py-3 text-left font-semibold text-slate-900">
                      {category.category}
                    </th>
                    <td className="px-3 py-3">
                      <StatusBadge status={category.status} />
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatMoney(category.allocatedBudget)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatMoney(category.approvedExpenses)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatMoney(category.pendingExpenses)}
                    </td>
                    <td
                      className={`px-3 py-3 text-right font-mono font-bold whitespace-nowrap ${
                        category.projectedRemainingBudget < 0 ? 'text-rose-700' : 'text-slate-900'
                      }`}
                    >
                      {formatMoney(category.projectedRemainingBudget)}
                    </td>
                    <td className="px-3.5 py-3">
                      <UsageMeter
                        approvedPct={category.utilizationPercentage}
                        projectedPct={category.projectedUtilizationPercentage}
                        label={category.category}
                      />
                      <div className="font-mono text-[11px] text-slate-600 mt-1 whitespace-nowrap">
                        {category.utilizationPercentage}% · {category.projectedUtilizationPercentage}% after pending
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <MeterLegend />
        </div>
      )}
    </div>
  );
}
