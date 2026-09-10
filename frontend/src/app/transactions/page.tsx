'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';

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
  receiptUrl?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function TransactionsPage() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE' | 'PENDING'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);

  // New Transaction Form State
  const [showNewModal, setShowNewModal] = useState(false);
  const [txTitle, setTxTitle] = useState('');
  const [txType, setTxType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [txAmount, setTxAmount] = useState('');
  const [txEventId, setTxEventId] = useState('evt-1');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/transactions`, { headers });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [token]);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let uploadedReceiptUrl: string | undefined = undefined;

      // Handle receipt upload if file selected
      if (receiptFile) {
        const formData = new FormData();
        formData.append('file', receiptFile);
        const uploadRes = await fetch(`${API_URL}/transactions/upload-receipt`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          uploadedReceiptUrl = uploadData.receiptUrl;
        }
      }

      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: txTitle,
          type: txType,
          amount: Number(txAmount),
          eventId: txEventId,
          receiptUrl: uploadedReceiptUrl,
        }),
      });

      if (response.ok) {
        alert(`Transaction "${txTitle}" submitted successfully for sign-off!`);
        setTxTitle('');
        setTxAmount('');
        setReceiptFile(null);
        setShowNewModal(false);
        fetchTransactions();
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to submit transaction.');
      }
    } catch (error) {
      console.error('Failed to submit transaction:', error);
      alert('Network error submitting transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <button
              onClick={() => setShowNewModal(true)}
              className="h-9 px-4 bg-[#0e1c2f] hover:bg-[#1a2d47] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>+ Submit Claim</span>
            </button>
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

          {isLoading ? (
            <div className="p-12 text-center text-xs text-[#44474c]">Loading transactions...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#eff4ff] text-[#44474c] uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-4">Ref & Date</th>
                    <th className="p-4">Transaction Title & Event</th>
                    <th className="p-4">Submitter</th>
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
          )}
        </section>
      </div>

      {/* NEW CLAIM SUBMISSION MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-[#c5c6cd]/20">
              <h3 className="font-['Hanken_Grotesk'] text-lg font-bold text-[#0b1c30]">
                Submit Transaction Claim
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-[#44474c] hover:text-[#0b1c30]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                  Transaction Title / Item
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sound Equipment Rental"
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#f8f9ff] border border-[#c5c6cd] rounded-lg text-xs text-[#0b1c30] focus:outline-none focus:border-[#426086]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0b1c30] mb-1">Type</label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as any)}
                    className="w-full p-2.5 bg-[#f8f9ff] border border-[#c5c6cd] rounded-lg text-xs text-[#0b1c30] focus:outline-none focus:border-[#426086]"
                  >
                    <option value="EXPENSE">Expense Disbursement</option>
                    <option value="INCOME">Income Deposit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                    Amount (LKR)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 15000"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full p-2.5 bg-[#f8f9ff] border border-[#c5c6cd] rounded-lg text-xs text-[#0b1c30] focus:outline-none focus:border-[#426086]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                  Attach Receipt (Image or PDF)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-[#44474c] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#eff4ff] file:text-[#0b1c30] hover:file:bg-[#dce9ff]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#44474c] hover:text-[#0b1c30]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#0e1c2f] hover:bg-[#1a2d47] text-white rounded-lg text-xs font-semibold"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

              {selectedTx.receiptUrl && (
                <div>
                  <span className="text-[10px] font-bold text-[#44474c] uppercase">
                    Attached Receipt Document
                  </span>
                  <a
                    href={selectedTx.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block p-2 bg-[#eff4ff] text-[#426086] font-semibold text-xs rounded-lg hover:underline truncate"
                  >
                    📎 View Attached Receipt Document
                  </a>
                </div>
              )}

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
