'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { BudgetCategory, BudgetItem, BudgetItemInput } from '@/lib/api';
import { formatMoney, toCents } from '@/lib/format';

interface BudgetItemModalProps {
  /** The item being edited; omit to add a new one. */
  item?: BudgetItem;
  categories: BudgetCategory[];
  /** Unallocated event budget, in cents, before this item is counted. */
  unallocatedCents: number;
  onClose: () => void;
  /** Rejects with an Error whose message is shown in the form. */
  onSave: (input: BudgetItemInput) => Promise<void>;
}

const inputClass =
  'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white';

export default function BudgetItemModal({
  item,
  categories,
  unallocatedCents,
  onClose,
  onSave,
}: BudgetItemModalProps) {
  const [itemName, setItemName] = useState(item?.itemName ?? '');
  const [categoryId, setCategoryId] = useState(item?.category.id ?? '');
  const [quantity, setQuantity] = useState(item ? String(item.quantity) : '1');
  const [unitPrice, setUnitPrice] = useState(item ? item.unitPrice.toFixed(2) : '');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isQuantityValid = /^\d+$/.test(quantity) && Number(quantity) >= 1;
  const isUnitPriceValid = /^\d+(\.\d{1,2})?$/.test(unitPrice) && Number(unitPrice) > 0;

  const allocatedCents =
    isQuantityValid && isUnitPriceValid ? Number(quantity) * toCents(Number(unitPrice)) : null;
  const availableCents = unallocatedCents + (item ? toCents(item.allocatedAmount) : 0);
  const excessCents = allocatedCents !== null ? allocatedCents - availableCents : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemName.trim()) return setFormError('Enter a budget item name.');
    if (!categoryId) return setFormError('Choose a category.');
    if (!isQuantityValid) return setFormError('Quantity must be a whole number of at least 1.');
    if (!isUnitPriceValid) {
      return setFormError('Unit price must be above zero, with up to 2 decimal places.');
    }
    if (excessCents > 0) {
      return setFormError(
        `This item exceeds the unallocated budget by ${formatMoney(excessCents / 100)}.`,
      );
    }

    setFormError(null);
    setIsSaving(true);
    try {
      await onSave({
        itemName: itemName.trim(),
        categoryId,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'The budget item could not be saved.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="budget-item-modal-title"
        className="bg-white max-w-md w-full max-h-full overflow-y-auto rounded-2xl shadow-xl border border-slate-200"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 id="budget-item-modal-title" className="font-bold text-base text-slate-900">
            {item ? 'Edit Budget Item' : 'Add Budget Item'}
          </h3>
          <button
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          onChange={() => setFormError(null)}
          noValidate
          className="p-6 space-y-4"
        >
          <div>
            <label htmlFor="budget-item-name" className="block text-xs font-semibold text-slate-700 mb-1">
              Item Name
            </label>
            <input
              id="budget-item-name"
              type="text"
              maxLength={150}
              autoFocus
              placeholder="e.g. Auditorium hire"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="budget-item-category" className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              id="budget-item-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="budget-item-quantity" className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity
              </label>
              <input
                id="budget-item-quantity"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </div>
            <div>
              <label htmlFor="budget-item-unit-price" className="block text-xs font-semibold text-slate-700 mb-1">
                Unit Price (LKR)
              </label>
              <input
                id="budget-item-unit-price"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-3 space-y-1.5 text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Allocated amount</span>
              <span className="font-mono font-bold text-slate-900">
                {allocatedCents !== null ? formatMoney(allocatedCents / 100) : '—'}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Available to allocate</span>
              <span className="font-mono text-slate-700">{formatMoney(availableCents / 100)}</span>
            </div>
            {excessCents > 0 && (
              <p className="text-rose-700 font-semibold pt-1">
                Over the unallocated budget by {formatMoney(excessCents / 100)}.
              </p>
            )}
          </div>

          {formError && (
            <p role="alert" className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs text-rose-800">
              {formError}
            </p>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : item ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
