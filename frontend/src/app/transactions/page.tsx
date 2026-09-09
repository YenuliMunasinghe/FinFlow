'use client';

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';

interface TransactionItem {
  id: string;
  refNo: string;
  type: 'INCOME' | 'EXPENSE';
  title: string;
  event: string;
  submitter: string;
  category: string;
  amount: number;
  date: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

const mockTransactions: TransactionItem[] = [
  {
    id: '1',
    refNo: 'TRX-2024-089',
    type: 'INCOME',
    title: 'Dialog Axiata Sponsorship Deposit',
    event: 'Annual Tech Symposium 2024',
    submitter: 'Kavinda Perera (EG/2021/8842)',
    category: 'Corporate Sponsorship',
    amount: 150000,
    date: 'Today, 10:24 AM',
    status: 'APPROVED',
  },
  {
    id: '2',
    refNo: 'TRX-2024-088',
    type: 'EXPENSE',
    title: 'Stage Sound & Lights Rental',
    event: 'Annual Tech Symposium 2024',
    submitter: 'Sandun Bandara (EG/2021/045)',
    category: 'Logistics',
    amount: 28500,
    date: 'Yesterday, 04:12 PM',
    status: 'PENDING',
  },
  {
    id: '3',
    refNo: 'TRX-2024-087',
    type: 'EXPENSE',
    title: 'Workshop Certificates & Banner Printing',
    event: 'Robotics Workshop',
    submitter: 'Dinithi Silva (EG/2021/112)',
    category: 'Printing & Stationery',
    amount: 14000,
    date: 'Jun 16, 02:00 PM',
    status: 'APPROVED',
  },
  {
    id: '4',
    refNo: 'TRX-2024-086',
    type: 'INCOME',
    title: 'Member Annual Subscription Dues (Batch 2021)',
    event: 'General Society Dues',
    submitter: 'Kavindu Ratnayake (EG/2022/089)',
    category: 'Member Dues',
    amount: 45000,
    date: 'Jun 14, 11:30 AM',
    status: 'APPROVED',
  },
  {
    id: '5',
    refNo: 'TRX-2024-085',
    type: 'EXPENSE',
    title: 'Unbudgeted Refreshment Claim (Missing Invoice)',
    event: 'Robotics Workshop',
    submitter: 'Nuwan Perera (EG/2022/104)',
    category: 'Catering',
    amount: 8500,
    date: 'Jun 12, 09:15 AM',
    status: 'REJECTED',
  },
];

export default function TransactionsPage() {
  const [transactions] = useState<TransactionItem[]>(mockTransactions);
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE' | 'PENDING'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);

  const filtered = transactions.filter((tx) => {
    const matchesFilter =
      filter === 'ALL'
        ? true
        : filter === 'INCOME'
        ? tx.type === 'INCOME'
        : filter === 'EXPENSE'
        ? tx.type === 'EXPENSE'
        : tx.status === 'PENDING';

    const matchesSearch =
      tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.refNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.submitter.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <Navigation pageTitle="Transactions Journal">
      <div className="space-y-6">
        {/* Header Ribbon */}
        <section className="bg-white p-6 rounded-xl shadow-xs border border-[#c5c6cd]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#0e1c2f]">receipt_long</span>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#426086] font-semibold uppercase tracking-wider">
                Society General Ledger
              </span>
            </div>
            <h2 className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] tracking-tight mt-1">
              Transactions & Vouchers
            </h2>
            <p className="text-xs text-[#44474c] mt-0.5">
              Complete auditable ledger of all income deposits, expense disbursements, and pending claims.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#44474c] text-base">
                search
              </span>
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-4 bg-[#eff4ff] rounded-lg text-xs text-[#0b1c30] placeholder:text-[#44474c] focus:outline-none focus:ring-1 focus:ring-[#426086]"
              />
            </div>
          </div>
        </section>

        {/* Filter Bar & Table Card */}
        <section className="bg-white rounded-xl shadow-xs border border-[#c5c6cd]/30 overflow-hidden">
          <div className="p-4 border-b border-[#c5c6cd]/20 flex flex-wrap items-center justify-between gap-3 bg-[#f8f9ff]/50">
            <div className="inline-flex p-1 bg-[#eff4ff] rounded-lg text-xs">
              {(['ALL', 'INCOME', 'EXPENSE', 'PENDING'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 font-semibold rounded-md transition-all ${
                    filter === tab
                      ? 'bg-white text-[#0b1c30] shadow-xs'
                      : 'text-[#44474c] hover:text-[#0b1c30]'
                  }`}
                >
                  {tab === 'ALL'
                    ? 'All Entries'
                    : tab === 'INCOME'
                    ? 'Incomes'
                    : tab === 'EXPENSE'
                    ? 'Expenses'
                    : 'Pending Sign-off'}
                </button>
              ))}
            </div>

            <span className="font-['JetBrains_Mono'] text-xs text-[#426086] font-semibold">
              Showing {filtered.length} of {transactions.length} entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#eff4ff] text-[#44474c] uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-4">Ref & Date</th>
                  <th className="p-4">Transaction Title & Event</th>
                  <th className="p-4">Submitter (Member ID)</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-right">Amount (LKR)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5c6cd]/20">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#eff4ff]/50 transition-colors">
                    <td className="p-4 font-['JetBrains_Mono']">
                      <div className="font-bold text-[#0b1c30]">#{tx.refNo}</div>
                      <div className="text-[10px] text-[#44474c]">{tx.date}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[#0b1c30]">{tx.title}</div>
                      <div className="text-[11px] text-[#44474c]">{tx.event}</div>
                    </td>
                    <td className="p-4 font-medium text-[#0b1c30]">{tx.submitter}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-[#eff4ff] text-[#426086] font-bold text-[10px]">
                        {tx.category}
                      </span>
                    </td>
                    <td
                      className={`p-4 text-right font-['JetBrains_Mono'] font-bold ${
                        tx.type === 'INCOME' ? 'text-[#10B981]' : 'text-[#ba1a1a]'
                      }`}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'} Rs.{' '}
                      {tx.amount.toLocaleString('en-US')}.00
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          tx.status === 'APPROVED'
                            ? 'bg-[#e5eeff] text-[#0e1c2f]'
                            : tx.status === 'PENDING'
                            ? 'bg-[#ffdad6] text-[#93000a]'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {tx.status === 'APPROVED'
                          ? 'Cleared'
                          : tx.status === 'PENDING'
                          ? 'Pending Sign-off'
                          : 'Rejected'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="px-2.5 py-1 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] font-semibold text-[11px] rounded transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* DETAIL MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-[#c5c6cd]/20">
              <h3 className="font-['Hanken_Grotesk'] text-lg font-bold text-[#0b1c30]">
                Voucher #{selectedTx.refNo}
              </h3>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-[#44474c] hover:text-[#0b1c30]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#44474c] uppercase">Title</span>
                <div className="font-bold text-[#0b1c30] text-sm mt-0.5">{selectedTx.title}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-[#eff4ff] p-3 rounded-lg">
                <div>
                  <span className="text-[10px] text-[#44474c]">Event</span>
                  <div className="font-semibold text-[#0b1c30]">{selectedTx.event}</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#44474c]">Category</span>
                  <div className="font-semibold text-[#0b1c30]">{selectedTx.category}</div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#44474c] uppercase">Submitter</span>
                <div className="font-medium text-[#0b1c30]">{selectedTx.submitter}</div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#c5c6cd]/20">
                <span className="text-xs font-bold text-[#0b1c30]">Transaction Amount</span>
                <span className="font-['JetBrains_Mono'] text-base font-bold text-[#0b1c30]">
                  Rs. {selectedTx.amount.toLocaleString('en-US')}.00
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="w-full py-2.5 bg-[#0e1c2f] text-white font-semibold text-xs rounded-lg hover:bg-[#1a2d47]"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </Navigation>
  );
}
