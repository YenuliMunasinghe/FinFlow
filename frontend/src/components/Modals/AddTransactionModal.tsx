'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddTransactionModal({ isOpen, onClose, onSuccess }: AddTransactionModalProps) {
  const { success, error } = useToast();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Logistics');
  const [event, setEvent] = useState('Annual Tech Symposium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || Number(amount) <= 0) {
      error('Please enter a valid title and amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      success(
        type === 'INCOME' ? 'Income Added' : 'Expense Submitted',
        `"${title}" for Rs. ${Number(amount).toLocaleString('en-US')} has been recorded.`
      );
      setTitle('');
      setAmount('');
      onClose();
      if (onSuccess) onSuccess();
    } catch {
      error('Failed to save transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900">Add New Transaction</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Selector Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Type</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setType('EXPENSE')}
                className={`py-2 text-xs font-bold rounded-lg transition-colors ${
                  type === 'EXPENSE' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                Expense (Outflow)
              </button>
              <button
                type="button"
                onClick={() => setType('INCOME')}
                className={`py-2 text-xs font-bold rounded-lg transition-colors ${
                  type === 'INCOME' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                Income (Inflow)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Title / Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Stage Equipment Rental or Sponsor Deposit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (LKR)</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 15000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                <option value="Logistics">Logistics</option>
                <option value="Venue">Venue</option>
                <option value="Food & Catering">Food & Catering</option>
                <option value="Printing">Printing & Stationery</option>
                <option value="Marketing">Marketing</option>
                <option value="Sponsorship">Corporate Sponsorship</option>
                <option value="Member Dues">Member Dues</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Linked Event</label>
            <select
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="Annual Tech Symposium">Annual Tech Symposium 2024</option>
              <option value="Inter-University Hackathon">Inter-University Hackathon 2024</option>
              <option value="Charity STEM Drive">Charity STEM Drive</option>
              <option value="General Administration">General Society Administration</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
