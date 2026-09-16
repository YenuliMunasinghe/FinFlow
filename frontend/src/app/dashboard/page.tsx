'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Calendar,
  CheckCircle,
  Clock,
} from 'lucide-react';
import AddTransactionModal from '@/components/Modals/AddTransactionModal';
import AddEventModal from '@/components/Modals/AddEventModal';
import TransactionDetailModal, { SimpleTransaction } from '@/components/Modals/TransactionDetailModal';
import { useToast } from '@/context/ToastContext';

const DEFAULT_TRANSACTIONS: SimpleTransaction[] = [
  {
    id: 'trx-1',
    refNo: 'TRX-089',
    title: 'Dialog Axiata Sponsorship Deposit',
    type: 'INCOME',
    amount: 150000,
    category: 'Corporate Sponsorship',
    event: 'Annual Tech Symposium',
    date: 'Sep 14, 2024',
    status: 'APPROVED',
    submitter: 'Senuri Silva (Treasurer)',
  },
  {
    id: 'trx-2',
    refNo: 'TRX-088',
    title: 'Stage Sound & Lighting Rental',
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
    title: 'Certificates & Badge Printing',
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
    title: 'Member Annual Registration Dues',
    type: 'INCOME',
    amount: 65000,
    category: 'Member Dues',
    event: 'General Administration',
    date: 'Sep 05, 2024',
    status: 'APPROVED',
    submitter: 'Senuri Silva',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { success } = useToast();

  const [transactions, setTransactions] = useState<SimpleTransaction[]>(DEFAULT_TRANSACTIONS);
  const [showAddTx, setShowAddTx] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedTx, setSelectedTx] = useState<SimpleTransaction | null>(null);

  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME' && t.status === 'APPROVED')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE' && t.status === 'APPROVED')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;
  const pendingCount = transactions.filter((t) => t.status === 'PENDING').length;

  const handleApprove = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'APPROVED' } : t))
    );
    success('Transaction Approved', 'Status updated to Approved.');
  };

  const handleReject = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'REJECTED' } : t))
    );
    success('Transaction Rejected', 'Status updated to Rejected.');
  };

  const handleDelete = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    success('Transaction Deleted', 'Entry removed from list.');
  };

  return (
    <Navigation pageTitle="Dashboard">
      <div className="space-y-6">
        {/* Welcome & Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Welcome, {user?.name || 'Society Member'}!
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Role: <strong className="text-slate-700 capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</strong> • Society Treasury Overview
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddTx(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Transaction</span>
            </button>
            <button
              onClick={() => setShowAddEvent(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* 3 Simple Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Current Balance</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              Rs. {balance.toLocaleString('en-US')}.00
            </div>
            <p className="text-[11px] text-slate-400">Total available society funds</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Total Income</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600 font-mono">
              + Rs. {totalIncome.toLocaleString('en-US')}.00
            </div>
            <p className="text-[11px] text-slate-400">Sponsorships & member dues</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Total Expenses</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-rose-600 font-mono">
              - Rs. {totalExpense.toLocaleString('en-US')}.00
            </div>
            <p className="text-[11px] text-slate-400">Disbursed event expenses</p>
          </div>
        </div>

        {/* Pending Approvals Notice if any */}
        {pendingCount > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                You have <strong className="font-bold">{pendingCount} pending transaction(s)</strong> awaiting approval.
              </span>
            </div>
            <Link
              href="/approvals"
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
            >
              Review Approvals →
            </Link>
          </div>
        )}

        {/* Recent Transactions Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Recent Transactions</h3>
            <Link
              href="/transactions"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View All Transactions →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Ref</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4 text-right">Amount (LKR)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">#{tx.refNo}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{tx.title}</td>
                    <td className="py-3 px-4 text-slate-600">{tx.category}</td>
                    <td className="py-3 px-4 text-slate-600">{tx.event}</td>
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTx(tx);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AddTransactionModal
        isOpen={showAddTx}
        onClose={() => setShowAddTx(false)}
        onSuccess={() => {}}
      />
      <AddEventModal
        isOpen={showAddEvent}
        onClose={() => setShowAddEvent(false)}
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
