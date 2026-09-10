'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'approved' | 'pending'>('all');

  // Form states
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Logistics');
  const [incomeTitle, setIncomeTitle] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeSource, setIncomeSource] = useState('Sponsorship');

  const userDisplayName = user?.name || 'Kavinda Perera';

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Expense Request "${expenseTitle}" for Rs. ${expenseAmount} submitted for executive approval!`);
    setExpenseTitle('');
    setExpenseAmount('');
    setShowExpenseModal(false);
  };

  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Income Deposit "${incomeTitle}" for Rs. ${incomeAmount} recorded successfully!`);
    setIncomeTitle('');
    setIncomeAmount('');
    setShowIncomeModal(false);
  };

  return (
    <Navigation pageTitle="Society Dashboard">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <section className="bg-white p-6 rounded-xl shadow-xs border border-[#c5c6cd]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#426086] font-semibold uppercase tracking-wider">
                Engineering Rotaract & Tech Club
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5c6cd]"></span>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#44474c]">Semester FY 2024/2025</span>
            </div>
            <h2 className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] tracking-tight mt-1">
              Welcome back, {userDisplayName}!
            </h2>
            <p className="text-xs text-[#44474c] mt-1">
              Event-Driven Financial Management & Accounting for University Student Societies
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowExpenseModal(true)}
              className="h-10 px-4 bg-[#0e1c2f] hover:bg-[#1a2d47] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>+ Submit Expense</span>
            </button>
            <button
              onClick={() => setShowIncomeModal(true)}
              className="h-10 px-4 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors border border-[#c5c6cd]/20"
            >
              <span className="material-symbols-outlined text-base text-[#426086]">south_west</span>
              <span>+ Record Income</span>
            </button>
          </div>
        </section>

        {/* 4 Clean Metric Strip */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Operating Reserve */}
          <div className="bg-white p-5 rounded-xl shadow-xs border border-[#c5c6cd]/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#44474c] uppercase tracking-wider">
                Operating Reserve
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#0e1c2f]">
                <span className="material-symbols-outlined text-base">account_balance</span>
              </div>
            </div>
            <div className="my-3">
              <div className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] tracking-tight">
                Rs. 485,250.00
              </div>
              <div className="text-xs text-[#44474c] mt-1">Society treasury account</div>
            </div>
            <div className="pt-2 border-t border-[#c5c6cd]/20 flex justify-between text-[11px] font-['JetBrains_Mono'] text-[#426086]">
              <span>Bank A/C: LKR 460k</span>
              <span>Petty Cash: LKR 25k</span>
            </div>
          </div>

          {/* Card 2: Total Income */}
          <div className="bg-white p-5 rounded-xl shadow-xs border border-[#c5c6cd]/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#44474c] uppercase tracking-wider">
                Total Inflow (Income)
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
                <span className="material-symbols-outlined text-base">south_west</span>
              </div>
            </div>
            <div className="my-3">
              <div className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] tracking-tight">
                Rs. 1,245,000.00
              </div>
              <div className="text-xs text-[#10B981] font-semibold mt-1">✓ Sponsorships & Member Dues</div>
            </div>
            <div className="pt-2 border-t border-[#c5c6cd]/20 text-[11px] font-['JetBrains_Mono'] text-[#44474c]">
              12 Deposits Recorded
            </div>
          </div>

          {/* Card 3: Total Expenses */}
          <div className="bg-white p-5 rounded-xl shadow-xs border border-[#c5c6cd]/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#44474c] uppercase tracking-wider">
                Total Outflow (Expenses)
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#ba1a1a]/10 flex items-center justify-center text-[#ba1a1a]">
                <span className="material-symbols-outlined text-base">north_east</span>
              </div>
            </div>
            <div className="my-3">
              <div className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] tracking-tight">
                Rs. 759,750.00
              </div>
              <div className="text-xs text-[#44474c] mt-1">Disbursed event expenses</div>
            </div>
            <div className="pt-2 border-t border-[#c5c6cd]/20 text-[11px] font-['JetBrains_Mono'] text-[#44474c]">
              24 Vouchers Cleared
            </div>
          </div>

          {/* Card 4: Pending Sign-offs */}
          <div className="bg-[#ffdad6]/30 p-5 rounded-xl shadow-xs border border-[#ba1a1a]/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#93000a] uppercase tracking-wider">
                Pending Sign-offs
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] animate-pulse"></span>
            </div>
            <div className="my-3">
              <div className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30]">3 Requests</div>
              <div className="text-xs font-bold text-[#93000a] mt-1">Rs. 62,500.00 Pending Release</div>
            </div>
            <Link
              href="/approvals"
              className="w-full py-2 bg-[#0e1c2f] text-white hover:bg-[#1a2d47] rounded-lg text-xs font-semibold text-center transition-colors shadow-xs"
            >
              Review Approvals Queue →
            </Link>
          </div>
        </section>

        {/* Recent Transactions Journal */}
        <section className="bg-white rounded-xl shadow-xs border border-[#c5c6cd]/30 overflow-hidden">
          <div className="p-5 border-b border-[#c5c6cd]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-['Hanken_Grotesk'] text-lg font-bold text-[#0b1c30]">
                Recent Society Transactions
              </h3>
              <p className="text-xs text-[#44474c]">General ledger entries for active society accounts</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex p-1 bg-[#eff4ff] rounded-lg text-xs">
                {(['all', 'approved', 'pending'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1 font-medium rounded-md transition-colors ${
                      activeFilter === filter
                        ? 'bg-white text-[#0b1c30] font-bold shadow-xs'
                        : 'text-[#44474c] hover:text-[#0b1c30]'
                    }`}
                  >
                    {filter === 'all' ? 'All' : filter === 'approved' ? 'Approved' : 'Pending'}
                  </button>
                ))}
              </div>
              <Link
                href="/transactions"
                className="px-3.5 py-1.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold rounded-lg transition-colors"
              >
                View All →
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#eff4ff] text-[#44474c] uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-4">Reference & Date</th>
                  <th className="p-4">Description & Event</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-right">Amount (LKR)</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5c6cd]/20">
                <tr className="hover:bg-[#eff4ff]/50 transition-colors">
                  <td className="p-4 font-['JetBrains_Mono']">
                    <div className="font-bold text-[#0b1c30]">#TRX-2024-089</div>
                    <div className="text-[10px] text-[#44474c]">Today, 10:24 AM</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-[#0b1c30]">Dialog Axiata Sponsorship Deposit</div>
                    <div className="text-[11px] text-[#44474c]">Annual Tech Symposium 2024</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] font-bold text-[10px]">
                      Sponsorship
                    </span>
                  </td>
                  <td className="p-4 text-right font-['JetBrains_Mono'] font-bold text-[#10B981]">
                    + Rs. 150,000.00
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-[#e5eeff] text-[#0e1c2f] font-bold text-[10px]">
                      Cleared & Approved
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-[#eff4ff]/50 transition-colors bg-[#eff4ff]/30">
                  <td className="p-4 font-['JetBrains_Mono']">
                    <div className="font-bold text-[#0b1c30]">#TRX-2024-088</div>
                    <div className="text-[10px] text-[#44474c]">Yesterday, 04:12 PM</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-[#0b1c30]">Stage Sound & Lights Rental</div>
                    <div className="text-[11px] text-[#44474c]">Sonic Pro Audio (Pvt) Ltd</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-[#eff4ff] text-[#44474c] font-bold text-[10px]">
                      Logistics
                    </span>
                  </td>
                  <td className="p-4 text-right font-['JetBrains_Mono'] font-bold text-[#ba1a1a]">
                    - Rs. 28,500.00
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-[#ffdad6] text-[#93000a] font-bold text-[10px]">
                      Pending President Sign-off
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-[#eff4ff]/50 transition-colors">
                  <td className="p-4 font-['JetBrains_Mono']">
                    <div className="font-bold text-[#0b1c30]">#TRX-2024-087</div>
                    <div className="text-[10px] text-[#44474c]">Jun 16 • 02:00 PM</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-[#0b1c30]">Workshop Certificates Printing</div>
                    <div className="text-[11px] text-[#44474c]">University Press</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-[#eff4ff] text-[#44474c] font-bold text-[10px]">
                      Printing & Stationery
                    </span>
                  </td>
                  <td className="p-4 text-right font-['JetBrains_Mono'] font-bold text-[#ba1a1a]">
                    - Rs. 14,000.00
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-[#e5eeff] text-[#0e1c2f] font-bold text-[10px]">
                      Cleared & Approved
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* SUBMIT EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-[#c5c6cd]/20">
              <h3 className="font-['Hanken_Grotesk'] text-lg font-bold text-[#0b1c30]">
                Submit Expense Claim
              </h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-[#44474c] hover:text-[#0b1c30]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                  Expense Title / Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sound Equipment Rental"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#f8f9ff] border border-[#c5c6cd] rounded-lg text-xs text-[#0b1c30] focus:outline-none focus:border-[#426086]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                  Amount (LKR)
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 15000"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full p-2.5 bg-[#f8f9ff] border border-[#c5c6cd] rounded-lg text-xs text-[#0b1c30] focus:outline-none focus:border-[#426086]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1">Category</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full p-2.5 bg-[#f8f9ff] border border-[#c5c6cd] rounded-lg text-xs text-[#0b1c30] focus:outline-none focus:border-[#426086]"
                >
                  <option value="Logistics">Logistics & Venue</option>
                  <option value="Catering">Food & Refreshments</option>
                  <option value="Printing">Printing & Stationery</option>
                  <option value="Marketing">Promotions & Marketing</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#44474c] hover:text-[#0b1c30]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0e1c2f] hover:bg-[#1a2d47] text-white rounded-lg text-xs font-semibold"
                >
                  Submit for Sign-off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD INCOME MODAL */}
      {showIncomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-[#c5c6cd]/20">
              <h3 className="font-['Hanken_Grotesk'] text-lg font-bold text-[#0b1c30]">
                Record Income Deposit
              </h3>
              <button
                onClick={() => setShowIncomeModal(false)}
                className="text-[#44474c] hover:text-[#0b1c30]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleIncomeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                  Income Title / Source
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Platinum Sponsorship Deposit"
                  value={incomeTitle}
                  onChange={(e) => setIncomeTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#f8f9ff] border border-[#c5c6cd] rounded-lg text-xs text-[#0b1c30] focus:outline-none focus:border-[#426086]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                  Amount (LKR)
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 50000"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  className="w-full p-2.5 bg-[#f8f9ff] border border-[#c5c6cd] rounded-lg text-xs text-[#0b1c30] focus:outline-none focus:border-[#426086]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1">Source Type</label>
                <select
                  value={incomeSource}
                  onChange={(e) => setIncomeSource(e.target.value)}
                  className="w-full p-2.5 bg-[#f8f9ff] border border-[#c5c6cd] rounded-lg text-xs text-[#0b1c30] focus:outline-none focus:border-[#426086]"
                >
                  <option value="Sponsorship">Corporate Sponsorship</option>
                  <option value="Member Dues">Member Registration Dues</option>
                  <option value="Ticket Sales">Event Ticket Sales</option>
                  <option value="Faculty Grant">Faculty / University Grant</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowIncomeModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#44474c] hover:text-[#0b1c30]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-xs font-semibold"
                >
                  Record Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Navigation>
  );
}
