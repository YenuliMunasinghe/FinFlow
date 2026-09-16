'use client';

import React, { useState } from 'react';
import { X, ArrowDownLeft } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface RecordIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SOURCES = [
  'Corporate Sponsorship',
  'Member Annual Dues',
  'Ticket Sales & Registrations',
  'Society / Institutional Grant',
  'Merchandise Sales',
  'Alumni Donation',
];

export default function RecordIncomeModal({ isOpen, onClose, onSuccess }: RecordIncomeModalProps) {
  const { success, error } = useToast();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [sourceType, setSourceType] = useState(SOURCES[0]);
  const [payerName, setPayerName] = useState('');
  const [depositRef, setDepositRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || Number(amount) <= 0) {
      error('Invalid Inflow Entry', 'Please enter a valid deposit title and amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const refNo = depositRef || `DEP-2024-${Math.floor(100 + Math.random() * 900)}`;
      success(
        'Income Deposit Recorded',
        `Received Rs. ${Number(amount).toLocaleString('en-US')}.00 from "${payerName || sourceType}" (Ref: #${refNo}).`
      );

      setTitle('');
      setAmount('');
      setPayerName('');
      setDepositRef('');
      onClose();
      if (onSuccess) onSuccess();
    } catch {
      error('Recording Failed', 'Unable to record deposit. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
              Treasury Inflow Deposit
            </span>
            <h3 className="font-heading text-lg font-bold text-white mt-0.5">
              Record Society Income
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Deposit Title / Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dialog Axiata Platinum Sponsorship Deposit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Deposit Amount (LKR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  Rs.
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="150000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Income Stream Type</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              >
                {SOURCES.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payer / Sponsor Entity
              </label>
              <input
                type="text"
                placeholder="e.g. Dialog Axiata PLC"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bank / Cheque Reference (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. SLIP-884912"
                value={depositRef}
                onChange={(e) => setDepositRef(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <ArrowDownLeft className="w-4 h-4 text-white" />
              <span>{isSubmitting ? 'Recording Inflow...' : 'Record Treasury Deposit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
