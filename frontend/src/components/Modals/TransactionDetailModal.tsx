'use client';

import React from 'react';
import { X, Check, Trash2, XCircle } from 'lucide-react';

export interface SimpleTransaction {
  id: string;
  refNo: string;
  title: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string;
  event: string;
  date: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  submitter?: string;
  vendor?: string;
}

interface TransactionDetailModalProps {
  transaction: SimpleTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function TransactionDetailModal({
  transaction,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onDelete,
}: TransactionDetailModalProps) {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold text-slate-400">
              #{transaction.refNo}
            </span>
            <h3 className="font-bold text-base text-slate-900 leading-tight">
              Transaction Details
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-slate-500 font-medium">Amount</span>
              <div
                className={`font-mono text-xl font-bold mt-0.5 ${
                  transaction.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'
                }`}
              >
                {transaction.type === 'INCOME' ? '+' : '-'} Rs.{' '}
                {transaction.amount.toLocaleString('en-US')}.00
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                transaction.status === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : transaction.status === 'PENDING'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {transaction.status}
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-slate-500 font-medium">Description</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{transaction.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-slate-500 font-medium">Event</span>
                <p className="font-semibold text-slate-800 mt-0.5">{transaction.event}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Category</span>
                <p className="font-semibold text-slate-800 mt-0.5">{transaction.category}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-slate-500 font-medium">Date</span>
                <p className="font-semibold text-slate-800 mt-0.5">{transaction.date}</p>
              </div>
              {transaction.submitter && (
                <div>
                  <span className="text-slate-500 font-medium">Recorded By</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{transaction.submitter}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {onDelete && (
            <button
              onClick={() => {
                onDelete(transaction.id);
                onClose();
              }}
              className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {transaction.status === 'PENDING' && onReject && (
              <button
                onClick={() => {
                  onReject(transaction.id);
                  onClose();
                }}
                className="px-3 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            )}

            {transaction.status === 'PENDING' && onApprove && (
              <button
                onClick={() => {
                  onApprove(transaction.id);
                  onClose();
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
