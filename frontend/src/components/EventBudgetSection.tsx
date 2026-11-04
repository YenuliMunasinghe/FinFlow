'use client';

import React from 'react';
import { Coins, Lock, PieChart, Plus, Pencil, Trash2, Wallet } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import { BudgetItem, EventSummary } from '@/lib/api';
import { formatMoney } from '@/lib/format';

interface EventBudgetSectionProps {
  event: EventSummary;
  items: BudgetItem[];
  canManage: boolean;
  /** Why items cannot be added yet (for example, no categories exist). */
  addDisabledReason?: string;
  onAdd: () => void;
  onEdit: (item: BudgetItem) => void;
  onDelete: (item: BudgetItem) => void;
}

export default function EventBudgetSection({
  event,
  items,
  canManage,
  addDisabledReason,
  onAdd,
  onEdit,
  onDelete,
}: EventBudgetSectionProps) {
  const { allocated: totalBudget, totalAllocated, unallocated } = event;
  // Rounded down so a budget with money left never reads as 100%.
  const allocatedPct =
    totalBudget > 0 ? Math.floor((totalAllocated / totalBudget) * 1000) / 10 : 0;

  return (
    <section aria-labelledby="event-budget-heading" className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total Event Budget"
          value={formatMoney(totalBudget)}
          icon={Wallet}
          footerText="Approved for this event"
        />
        <MetricCard
          title="Total Allocated"
          value={formatMoney(totalAllocated)}
          icon={PieChart}
          variant="indigo"
          footerText={`${allocatedPct.toFixed(1)}% of the event budget`}
        />
        <MetricCard
          title="Remaining Unallocated"
          value={formatMoney(unallocated)}
          icon={Coins}
          variant={unallocated === 0 && totalBudget > 0 ? 'warning' : 'success'}
          footerText={unallocated === 0 ? 'Fully allocated' : 'Available for new items'}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
          <div>
            <h2 id="event-budget-heading" className="text-base font-bold text-slate-900">
              Event Budget
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Each item&apos;s allocation is its quantity × unit price.
            </p>
          </div>

          {canManage && (
            <button
              onClick={onAdd}
              disabled={Boolean(addDisabledReason)}
              title={addDisabledReason}
              className="self-start sm:self-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              <span>Add Budget Item</span>
            </button>
          )}
        </div>

        {!canManage && (
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-xs text-slate-600">
            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>View only. The Treasurer, President or an Admin can change budget items.</span>
          </div>
        )}

        {canManage && addDisabledReason && (
          <p className="px-5 py-3 bg-amber-50 border-b border-amber-100 text-xs text-amber-800">
            {addDisabledReason}
          </p>
        )}

        {items.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold text-slate-700">No budget items yet</p>
            <p className="text-xs text-slate-500 mt-1">
              {canManage
                ? 'Add the first item to start allocating this event’s budget.'
                : 'Budget items will appear here once they are added.'}
            </p>
          </div>
        ) : (
          // `relative` keeps the absolutely positioned sr-only header inside the scroll area.
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[640px] text-xs">
              <thead>
                <tr className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th scope="col" className="px-5 py-3">Item</th>
                  <th scope="col" className="px-3 py-3">Category</th>
                  <th scope="col" className="px-3 py-3 text-right">Qty</th>
                  <th scope="col" className="px-3 py-3 text-right">Unit Price</th>
                  <th scope="col" className="px-3 py-3 text-right">Allocated</th>
                  {canManage && (
                    <th scope="col" className="px-5 py-3 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-semibold text-slate-900">{item.itemName}</td>
                    <td className="px-3 py-3 text-slate-600">{item.category.name}</td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700">
                      {item.quantity.toLocaleString('en-US')}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatMoney(item.unitPrice)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatMoney(item.allocatedAmount)}
                    </td>
                    {canManage && (
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => onEdit(item)}
                            aria-label={`Edit ${item.itemName}`}
                            title="Edit"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(item)}
                            aria-label={`Delete ${item.itemName}`}
                            title="Delete"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
