'use client';

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import AddEventModal from '@/components/Modals/AddEventModal';
import { Plus, Calendar, MapPin, Trash2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface EventItem {
  id: string;
  name: string;
  code: string;
  date: string;
  venue?: string;
  totalBudget: number;
  spent: number;
}

const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'evt-1',
    name: 'Annual Tech Symposium 2024',
    code: 'ATS-24',
    date: 'Oct 15, 2024',
    venue: 'Main Auditorium',
    totalBudget: 450000,
    spent: 312500,
  },
  {
    id: 'evt-2',
    name: 'Inter-University Hackathon 2024',
    code: 'HACK-24',
    date: 'Nov 02, 2024',
    venue: 'Computing Complex Lab 3',
    totalBudget: 350000,
    spent: 248750,
  },
  {
    id: 'evt-3',
    name: 'STEM Charity & Schools Outreach Drive',
    code: 'CHARITY-24',
    date: 'Dec 10, 2024',
    venue: 'Central Province School Hall',
    totalBudget: 200000,
    spent: 45000,
  },
  {
    id: 'evt-4',
    name: 'General Society Administration',
    code: 'ADMIN-24',
    date: 'Year-Round 2024',
    venue: 'Society Office',
    totalBudget: 120000,
    spent: 65000,
  },
];

export default function EventsPage() {
  const { success } = useToast();
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleDeleteEvent = (id: string, name: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    success('Event Deleted', `"${name}" removed.`);
  };

  return (
    <Navigation pageTitle="Events">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Society Events & Budgets</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track project budgets, date schedules, and total spending.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((evt) => {
            const pct = evt.totalBudget > 0 ? Math.round((evt.spent / evt.totalBudget) * 100) : 0;
            const remaining = evt.totalBudget - evt.spent;

            return (
              <div
                key={evt.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-600">#{evt.code}</span>
                    <button
                      onClick={() => handleDeleteEvent(evt.id, evt.name)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900">{evt.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.date}</span>
                      </span>
                      {evt.venue && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{evt.venue}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">Budget Spent</span>
                      <span className="font-mono font-bold text-slate-900">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 90 ? 'bg-rose-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-slate-500">
                      <span>Spent: Rs. {evt.spent.toLocaleString('en-US')}</span>
                      <span>Budget: Rs. {evt.totalBudget.toLocaleString('en-US')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Remaining Balance:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    Rs. {remaining.toLocaleString('en-US')}.00
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL */}
      <AddEventModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {}}
      />
    </Navigation>
  );
}
