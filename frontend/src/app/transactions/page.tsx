'use client';

import React, { useState, useMemo } from 'react';
import Navigation from '@/components/Navigation';
import AddTransactionModal from '@/components/Modals/AddTransactionModal';
import TransactionDetailModal, { SimpleTransaction } from '@/components/Modals/TransactionDetailModal';
import { Search, Plus, Trash2, Check, XCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const INITIAL_TRANSACTIONS: SimpleTransaction[] = [
  {
    id: 'trx-1',
    refNo: 'TRX-089',
    title: 'Dialog Axiata Corporate Sponsorship Deposit',
    type: 'INCOME',
    amount: 150000,
    category: 'Corporate Sponsorship',
    event: 'Annual Tech Symposium',
    date: 'Sep 14, 2024',
    status: 'APPROVED',
    submitter: 'Senuri Silva',
  },
  {
    id: 'trx-2',
    refNo: 'TRX-088',
    title: 'Stage Audio & Lighting Rental',
    type: 'EXPENSE',
    amount: 28500,
    category: 'Logistics',
    event: 'Annual Tech Symposium',
    date: 'Sep 13, 2024',
    status: 'PENDING',
    submitter: 'Malith Bandara',
  },
  {
    id: 'trx-3',
    refNo: 'TRX-087',
    title: 'Delegate Certificates & Badge Printing',
    type: 'EXPENSE',
    amount: 14000,
    category: 'Printing',
    event: 'Annual Tech Symposium',
    date: 'Sep 11, 2024',
    status: 'APPROVED',
    submitter: 'Kusal Mendis',
  },
  {
    id: 'trx-4',
    refNo: 'TRX-086',
    title: 'Workshop Lunch Refreshments',
    type: 'EXPENSE',
    amount: 34000,
    category: 'Food & Catering',
    event: 'Inter-University Hackathon',
    date: 'Sep 09, 2024',
    status: 'APPROVED',
    submitter: 'Dinuka Fernando',
  },
  {
    id: 'trx-5',
    refNo: 'TRX-085',
    title: 'Annual Society Member Registration Dues',
    type: 'INCOME',
    amount: 65000,
    category: 'Member Dues',
    event: 'General Administration',
    date: 'Sep 05, 2024',
    status: 'APPROVED',
    submitter: 'Senuri Silva',
  },
  {
    id: 'trx-6',
    refNo: 'TRX-084',
    title: 'Venue Security & Cleaning Fee',
    type: 'EXPENSE',
    amount: 20000,
    category: 'Venue',
    event: 'Annual Tech Symposium',
    date: 'Sep 02, 2024',
    status: 'PENDING',
    submitter: 'Malith Bandara',
  },
];

export default function TransactionsPage() {
  const { success } = useToast();
  const [transactions, setTransactions] = useState<SimpleTransaction[]>(INITIAL_TRANSACTIONS);
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE' | 'PENDING'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<SimpleTransaction | null>(null);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesType =
        filterType === 'ALL'
          ? true
          : filterType === 'INCOME'
          ? tx.type === 'INCOME'
          : filterType === 'EXPENSE'
          ? tx.type === 'EXPENSE'
          : tx.status === 'PENDING';

      const q = searchTerm.toLowerCase();
      const matchesSearch =
        tx.title.toLowerCase().includes(q) ||
        tx.refNo.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        tx.event.toLowerCase().includes(q);

      return matchesType && matchesSearch;
    });
  }, [transactions, filterType, searchTerm]);

  const handleApprove = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'APPROVED' } : t))
    );
    success('Approved', 'Transaction approved.');
  };

  const handleReject = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'REJECTED' } : t))
    );
    success('Rejected', 'Transaction rejected.');
  };

  const handleDelete = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    success('Deleted', 'Transaction removed.');
  };

  return (
    <Navigation pageTitle="Transactions">
      <div className="space-y-6">
        {/* Header Ribbon */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Transactions Journal</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Record and manage all society income deposits and expense disbursements.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              {(['ALL', 'INCOME', 'EXPENSE', 'PENDING'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterType(tab)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    filterType === tab
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab === 'ALL'
                    ? 'All'
                    : tab === 'INCOME'
                    ? 'Income'
                    : tab === 'EXPENSE'
                    ? 'Expenses'
                    : 'Pending'}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Ref</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount (LKR)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((tx) => (
                    <tr
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">#{tx.refNo}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{tx.title}</td>
                      <td className="py-3 px-4 text-slate-600">{tx.category}</td>
                      <td className="py-3 px-4 text-slate-600">{tx.event}</td>
                      <td className="py-3 px-4 text-slate-500">{tx.date}</td>
                      <td
                        className={`py-3 px-4 text-right font-mono font-bold ${
                          tx.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {tx.type === 'INCOME' ? '+' : '-'} Rs. {tx.amount.toLocaleString('en-US')}.00
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedTx(tx)}
                            className="px-2 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 rounded"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {}}
      />
      <TransactionDetailModal
        transaction={selectedTx}
        isOpen={Boolean(selectedTx)}
        onClose={() => setSelectedTx(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
      />
    </Navigation>
  );
}
