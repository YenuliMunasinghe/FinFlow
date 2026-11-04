'use client';

import React, { useState } from 'react';
import { BudgetItem } from '@/lib/api';
import { formatMoney } from '@/lib/format';

interface DeleteBudgetItemModalProps {
  item: BudgetItem;
  onClose: () => void;
  /** Rejects with an Error whose message is shown in the dialog. */
  onConfirm: () => Promise<void>;
}

export default function DeleteBudgetItemModal({ item, onClose, onConfirm }: DeleteBudgetItemModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setErrorMessage(null);
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'The budget item could not be deleted.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-budget-item-title"
        className="bg-white max-w-sm w-full rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4"
      >
        <div>
          <h3 id="delete-budget-item-title" className="font-bold text-base text-slate-900">
            Delete this budget item?
          </h3>
          <p className="text-xs text-slate-600 mt-1.5">
            <strong className="text-slate-900">{item.itemName}</strong> ({formatMoney(item.allocatedAmount)}) will be
            removed, and its amount returned to the unallocated budget.
          </p>
        </div>

        {errorMessage && (
          <p role="alert" className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs text-rose-800">
            {errorMessage}
          </p>
        )}

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Item'}
          </button>
        </div>
      </div>
    </div>
  );
}
