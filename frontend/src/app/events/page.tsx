'use client';

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';

interface EventBudget {
  id: string;
  title: string;
  code: string;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  date: string;
  allocated: number;
  spent: number;
  categories: {
    name: string;
    allocated: number;
    spent: number;
  }[];
}

const mockEvents: EventBudget[] = [
  {
    id: '1',
    title: 'Annual Tech Symposium 2024',
    code: 'EVT-2024-01',
    status: 'ACTIVE',
    date: 'Oct 15, 2024',
    allocated: 450000,
    spent: 278500,
    categories: [
      { name: 'Logistics & Venue', allocated: 200000, spent: 150000 },
      { name: 'Audio/Visual Hire', allocated: 100000, spent: 78500 },
      { name: 'Food & Refreshments', allocated: 100000, spent: 35000 },
      { name: 'Certificates & Printing', allocated: 50000, spent: 15000 },
    ],
  },
  {
    id: '2',
    title: 'Robotics & AI Hands-on Workshop',
    code: 'EVT-2024-02',
    status: 'ACTIVE',
    date: 'Nov 02, 2024',
    allocated: 120000,
    spent: 42000,
    categories: [
      { name: 'Hardware Kits', allocated: 70000, spent: 28000 },
      { name: 'Refreshments', allocated: 30000, spent: 14000 },
      { name: 'Certificates & Banners', allocated: 20000, spent: 0 },
    ],
  },
  {
    id: '3',
    title: 'Freshers Orientation & Social 2024',
    code: 'EVT-2024-03',
    status: 'COMPLETED',
    date: 'Aug 20, 2024',
    allocated: 180000,
    spent: 175000,
    categories: [
      { name: 'Food & Catering', allocated: 120000, spent: 120000 },
      { name: 'Sound System', allocated: 40000, spent: 38000 },
      { name: 'Decorations', allocated: 20000, spent: 17000 },
    ],
  },
];

export default function EventsPage() {
  const [events] = useState<EventBudget[]>(mockEvents);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventBudget | null>(null);

  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventBudget, setNewEventBudget] = useState('');
  const [newEventDate, setNewEventDate] = useState('');

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`New Event "${newEventTitle}" created with approved budget Rs. ${Number(newEventBudget).toLocaleString('en-US')}!`);
    setNewEventTitle('');
    setNewEventBudget('');
    setNewEventDate('');
    setShowCreateModal(false);
  };

  return (
    <Navigation pageTitle="Events & Budget Allocations">
      <div className="space-y-6">
        {/* Header Ribbon */}
        <section className="bg-white p-6 rounded-xl shadow-xs border border-[#c5c6cd]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#0e1c2f]">event</span>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#426086] font-semibold uppercase tracking-wider">
                Society Event Governance
              </span>
            </div>
            <h2 className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] tracking-tight mt-1">
              Events & Allocated Budgets
            </h2>
            <p className="text-xs text-[#44474c] mt-0.5">
              Track society project budgets, category spend progress, and remaining financial reserves.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="h-10 px-4 bg-[#0e1c2f] hover:bg-[#1a2d47] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>+ Create New Event</span>
          </button>
        </section>

        {/* Event Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((evt) => {
            const pct = Math.round((evt.spent / evt.allocated) * 100);
            return (
              <div
                key={evt.id}
                className="bg-white rounded-xl shadow-xs border border-[#c5c6cd]/30 p-6 flex flex-col justify-between space-y-4 hover:border-[#38BDF8] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-['JetBrains_Mono'] text-[11px] font-bold text-[#426086]">
                      #{evt.code}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        evt.status === 'ACTIVE'
                          ? 'bg-[#10B981]/10 text-[#10B981]'
                          : evt.status === 'UPCOMING'
                          ? 'bg-[#eff4ff] text-[#426086]'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-['Hanken_Grotesk'] text-lg font-bold text-[#0b1c30]">
                      {evt.title}
                    </h3>
                    <div className="text-xs text-[#44474c] mt-0.5">Target Date: {evt.date}</div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#0b1c30]">Budget Utilization</span>
                      <span className="font-['JetBrains_Mono'] text-[#426086]">{pct}%</span>
                    </div>
                    <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct > 90 ? 'bg-[#ba1a1a]' : 'bg-[#0e1c2f]'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] font-['JetBrains_Mono'] text-[#44474c]">
                      <span>Spent: Rs. {evt.spent.toLocaleString('en-US')}</span>
                      <span>Total: Rs. {evt.allocated.toLocaleString('en-US')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#c5c6cd]/20 flex justify-between items-center">
                  <span className="text-xs font-bold text-[#10B981]">
                    Balance: Rs. {(evt.allocated - evt.spent).toLocaleString('en-US')}
                  </span>
                  <button
                    onClick={() => setSelectedEvent(evt)}
                    className="px-3 py-1.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold rounded-lg transition-colors"
                  >
                    Category Breakdown →
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </div>

      {/* CREATE EVENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-[#c5c6cd]/20">
              <h3 className="font-['Hanken_Grotesk'] text-lg font-bold text-[#0b1c30]">
                Create Society Event
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#44474c] hover:text-[#0b1c30]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                  Event Name / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Hackathon 2024"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#f8f9ff] border border-[#c5c6cd] rounded-lg text-xs text-[#0b1c30] focus:outline-none focus:border-[#426086]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                  Total Approved Budget (LKR)
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 250000"
                  value={newEventBudget}
                  onChange={(e) => setNewEventBudget(e.target.value)}
                  className="w-full p-2.5 bg-[#f8f9ff] border border-[#c5c6cd] rounded-lg text-xs text-[#0b1c30] focus:outline-none focus:border-[#426086]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                  Target Event Date
                </label>
                <input
                  type="date"
                  required
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full p-2.5 bg-[#f8f9ff] border border-[#c5c6cd] rounded-lg text-xs text-[#0b1c30] focus:outline-none focus:border-[#426086]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#44474c] hover:text-[#0b1c30]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0e1c2f] hover:bg-[#1a2d47] text-white rounded-lg text-xs font-semibold"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY BREAKDOWN MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full rounded-xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-[#c5c6cd]/20">
              <div>
                <h3 className="font-['Hanken_Grotesk'] text-lg font-bold text-[#0b1c30]">
                  {selectedEvent.title}
                </h3>
                <span className="font-['JetBrains_Mono'] text-xs text-[#426086]">
                  #{selectedEvent.code} • Total Budget: Rs.{' '}
                  {selectedEvent.allocated.toLocaleString('en-US')}
                </span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-[#44474c] hover:text-[#0b1c30]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider">
                Category Allocations & Spending
              </div>
              {selectedEvent.categories.map((cat, i) => (
                <div key={i} className="p-3 bg-[#eff4ff] rounded-lg space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-[#0b1c30]">
                    <span>{cat.name}</span>
                    <span className="font-['JetBrains_Mono']">
                      Rs. {cat.spent.toLocaleString('en-US')} / Rs.{' '}
                      {cat.allocated.toLocaleString('en-US')}
                    </span>
                  </div>
                  <div className="w-full bg-white h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0e1c2f] h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((cat.spent / cat.allocated) * 100)
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full py-2.5 bg-[#0e1c2f] text-white font-semibold text-xs rounded-lg hover:bg-[#1a2d47]"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </Navigation>
  );
}
