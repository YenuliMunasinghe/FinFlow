'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Calendar, MapPin, RefreshCw } from 'lucide-react';
import EventBudgetSection from '@/components/EventBudgetSection';
import EventInsightsPanel from '@/components/EventInsightsPanel';
import BudgetItemModal from '@/components/Modals/BudgetItemModal';
import DeleteBudgetItemModal from '@/components/Modals/DeleteBudgetItemModal';
import Navigation from '@/components/Navigation';
import { canManageBudgets, useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  ApiError,
  BudgetCategory,
  BudgetItem,
  BudgetItemInput,
  createBudgetItem,
  deleteBudgetItem,
  EventSummary,
  getEvent,
  listBudgetCategories,
  listBudgetItems,
  updateBudgetItem,
} from '@/lib/api';
import { formatEventDate, toCents } from '@/lib/format';

interface EventBudgetData {
  event: EventSummary;
  items: BudgetItem[];
  categories: BudgetCategory[];
}

type ActiveModal =
  | { type: 'add' }
  | { type: 'edit'; item: BudgetItem }
  | { type: 'delete'; item: BudgetItem }
  | null;

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { token, user, logout } = useAuth();
  const { success, warning } = useToast();
  const canManage = canManageBudgets(user?.role);

  const [data, setData] = useState<EventBudgetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [insightsStale, setInsightsStale] = useState(false);

  // Always re-read from the API so the totals shown are the backend's own.
  const fetchData = useCallback(async (): Promise<EventBudgetData> => {
    const [event, items, categories] = await Promise.all([
      getEvent(token, eventId),
      listBudgetItems(token, eventId),
      canManage ? listBudgetCategories(token) : Promise.resolve([]),
    ]);
    return { event, items, categories };
  }, [token, eventId, canManage]);

  useEffect(() => {
    if (!token) return;
    let isCurrent = true;

    fetchData()
      .then((result) => {
        if (!isCurrent) return;
        setData(result);
        setLoadError(null);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        if (!isCurrent) return;
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setLoadError(err);
        setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [token, fetchData, logout, reloadCount]);

  const handleRetry = () => {
    setIsLoading(true);
    setLoadError(null);
    setReloadCount((count) => count + 1);
  };

  /** Runs a change, then closes the dialog and refreshes the totals. */
  const applyChange = async (change: () => Promise<unknown>, title: string, message: string) => {
    try {
      await change();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) logout();
      throw err;
    }

    // Insights call Gemini, so changes mark them out of date instead of regenerating them.
    setInsightsStale(true);

    try {
      setData(await fetchData());
    } catch {
      warning('Totals May Be Out of Date', 'Your change was saved, but the page could not refresh. Reload to see it.');
    }
    setActiveModal(null);
    success(title, message);
  };

  const handleSave = (input: BudgetItemInput, item?: BudgetItem) =>
    applyChange(
      () =>
        item
          ? updateBudgetItem(token, eventId, item.id, input)
          : createBudgetItem(token, eventId, input),
      item ? 'Budget Item Updated' : 'Budget Item Added',
      `"${input.itemName}" was saved.`,
    );

  const handleDelete = (item: BudgetItem) =>
    applyChange(
      () => deleteBudgetItem(token, eventId, item.id),
      'Budget Item Deleted',
      `"${item.itemName}" was removed.`,
    );

  return (
    <Navigation pageTitle={data?.event.title ?? 'Event'}>
      <div className="space-y-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Events</span>
        </Link>

        {isLoading ? (
          <div role="status" className="py-20 flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-500 font-medium">Loading event budget...</span>
          </div>
        ) : loadError || !data ? (
          <EventLoadError error={loadError} onRetry={handleRetry} />
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-600">#{data.event.code}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                  {data.event.status}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1.5">{data.event.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatEventDate(data.event.date)}</span>
                </span>
                {data.event.venue && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{data.event.venue}</span>
                  </span>
                )}
              </div>
            </div>

            <EventBudgetSection
              event={data.event}
              items={data.items}
              canManage={canManage}
              addDisabledReason={
                data.categories.length === 0
                  ? 'No budget categories exist yet, so items cannot be added. Run the database seed to create them.'
                  : undefined
              }
              onAdd={() => setActiveModal({ type: 'add' })}
              onEdit={(item) => setActiveModal({ type: 'edit', item })}
              onDelete={(item) => setActiveModal({ type: 'delete', item })}
            />

            <EventInsightsPanel
              eventId={eventId}
              isStale={insightsStale}
              onRefreshStart={() => setInsightsStale(false)}
            />

            {(activeModal?.type === 'add' || activeModal?.type === 'edit') && (
              <BudgetItemModal
                item={activeModal.type === 'edit' ? activeModal.item : undefined}
                categories={data.categories}
                unallocatedCents={toCents(data.event.unallocated)}
                onClose={() => setActiveModal(null)}
                onSave={(input) =>
                  handleSave(input, activeModal.type === 'edit' ? activeModal.item : undefined)
                }
              />
            )}

            {activeModal?.type === 'delete' && (
              <DeleteBudgetItemModal
                item={activeModal.item}
                onClose={() => setActiveModal(null)}
                onConfirm={() => handleDelete(activeModal.item)}
              />
            )}
          </>
        )}
      </div>
    </Navigation>
  );
}

function EventLoadError({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
  const status = error instanceof ApiError ? error.status : undefined;
  const heading =
    status === 404
      ? 'Event not found'
      : status === 403
        ? 'You don’t have access to this event'
        : 'The event budget could not be loaded';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs px-6 py-12 text-center">
      <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto" />
      <p className="text-sm font-semibold text-slate-800 mt-3">{heading}</p>
      {error && <p className="text-xs text-slate-500 mt-1">{error.message}</p>}
      {status !== 404 && status !== 403 && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}
