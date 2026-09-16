'use client';

import React, { useState } from 'react';
import { X, Upload, CheckCircle, DollarSign } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

interface ExpenseClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = [
  'Logistics & Audio',
  'Venue & Staging',
  'Food & Refreshments',
  'Printing & Stationery',
  'Promotions & Marketing',
  'Prizes & Mementos',
  'Miscellaneous',
];

const EVENTS = [
  { id: 'evt-1', title: 'Annual Tech Symposium 2024 (ATS-24)' },
  { id: 'evt-2', title: 'Inter-University Hackathon 2024 (HACK-24)' },
  { id: 'evt-3', title: 'Community Outreach & Charity Drive (CHARITY-24)' },
  { id: 'evt-4', title: 'General Society Administration' },
];

export default function ExpenseClaimModal({ isOpen, onClose, onSuccess }: ExpenseClaimModalProps) {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [eventId, setEventId] = useState(EVENTS[0].id);
  const [vendorName, setVendorName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || Number(amount) <= 0) {
      error('Invalid Expense Claim', 'Please provide a valid title and amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const voucherId = `TRX-2024-${Math.floor(100 + Math.random() * 900)}`;
      success(
        'Expense Claim Submitted Successfully',
        `Voucher #${voucherId} for Rs. ${Number(amount).toLocaleString('en-US')}.00 is now queued for President sign-off.`
      );

      setTitle('');
      setAmount('');
      setVendorName('');
      setFile(null);
      onClose();
      if (onSuccess) onSuccess();
    } catch {
      error('Submission Error', 'Failed to submit claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
              Treasury Voucher Entry
            </span>
            <h3 className="font-heading text-lg font-bold text-white mt-0.5">
              Submit Expense Claim
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Submitter info alert */}
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between text-xs text-sky-900">
            <span className="font-medium">
              Submitting as: <strong className="font-bold">{user?.name || 'Executive Member'}</strong> ({user?.role})
            </span>
            <span className="px-2 py-0.5 rounded-full bg-sky-200/80 font-mono text-[10px] font-bold">
              {user?.memberId || 'EG/2021/8842'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Expense Item Title / Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Stage Sound System & Lighting Rental"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Claim Amount (LKR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  Rs.
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="25000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Vendor / Supplier Name
              </label>
              <input
                type="text"
                placeholder="e.g. Sonic Pro Audio (Pvt) Ltd"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expense Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Associated Event</label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              >
                {EVENTS.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Drag & Drop Receipt Upload Zone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Attach Proof Receipt / Invoice (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-sky-500 bg-slate-50/60 rounded-xl p-4 text-center cursor-pointer transition-colors relative">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold text-xs">
                  <CheckCircle className="w-4 h-4" />
                  <span>{file.name} ({(file.size / 1024).toFixed(0)} KB)</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">
                    Click to browse or drag & drop receipt file
                  </p>
                  <p className="text-[10px] text-slate-400">Supports PDF, PNG, JPG (Max 5MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer Actions */}
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
              className="px-5 py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <DollarSign className="w-4 h-4 text-cyan-400" />
              <span>{isSubmitting ? 'Routing for Sign-off...' : 'Submit Claim Voucher'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
