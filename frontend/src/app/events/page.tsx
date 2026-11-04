'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Calendar, ChevronRight, MapPin, Plus, RefreshCw } from 'lucide-react';
import Navigation from '@/components/Navigation';
import AddEventModal from '@/components/Modals/AddEventModal';
import { canManageBudgets, useAuth } from '@/context/AuthContext';
import { ApiError, EventSummary, listEvents } from '@/lib/api';
import { formatEventDate, formatMoney } from '@/lib/format';

export default function EventsPage() {
  const router = useRouter();
  const { token, user, logout } = useAuth();
  const canManage = canManageBudgets(user?.role);

  const [events, setEvents] = useState<EventSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    let isCurrent = true;

    listEvents(token)
      .then((result) => {
        if (!isCurrent) return;
        setEvents(result);
        setLoadError(null);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        if (!isCurrent) return;
        if (err instanceof ApiError && err.status === 401) {
          logout();
          return;
        }
        setLoadError(err.message);
        setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [token, logout, reloadCount]);

  const handleRetry = () => {
    setIsLoading(true);
    setLoadError(null);
    setReloadCount((count) => count + 1);
  };

  return (
    <Navigation pageTitle="Events">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Society Events & Budgets</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Open an event to manage its budget items and see how much is allocated.
            </p>
          </div>

          {canManage && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          )}
        </div>

        {isLoading ? (
          <div role="status" className="py-20 flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-500 font-medium">Loading events...</span>
          </div>
        ) : loadError ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs px-6 py-12 text-center">
            <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-800 mt-3">Events could not be loaded</p>
            <p className="text-xs text-slate-500 mt-1">{loadError}</p>
            <button
              onClick={handleRetry}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs px-6 py-12 text-center">
            <p className="text-sm font-semibold text-slate-700">No events yet</p>
            <p className="text-xs text-slate-500 mt-1">
              {canManage ? 'Add an event to start planning its budget.' : 'Events will appear here once they are added.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((evt) => {
              const { totalAllocated, unallocated } = evt;
              // Rounded down so a budget with money left never reads as 100%.
              const pct = evt.allocated > 0 ? Math.floor((totalAllocated / evt.allocated) * 100) : 0;

              return (
                <Link
                  key={evt.id}
                  href={`/events/${evt.id}`}
                  className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-600">#{evt.code}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-slate-900">{evt.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatEventDate(evt.date)}</span>
                        </span>
                        {evt.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{evt.venue}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Allocation Progress */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">Budget Allocated</span>
                        <span className="font-mono font-bold text-slate-900">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap justify-between gap-x-3 text-[11px] font-mono text-slate-500">
                        <span>Allocated: {formatMoney(totalAllocated)}</span>
                        <span>Budget: {formatMoney(evt.allocated)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-500">Remaining Unallocated:</span>
                    <span className="font-mono font-bold text-emerald-600">{formatMoney(unallocated)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL */}
      <AddEventModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={(event) => router.push(`/events/${event.id}`)}
      />
    </Navigation>
  );
}
