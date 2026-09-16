'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import { Printer, Download, Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const CATEGORIES_DATA = [
  { name: 'Logistics & Audio', allocated: 250000, spent: 180000 },
  { name: 'Venue & Staging', allocated: 350000, spent: 290000 },
  { name: 'Food & Refreshments', allocated: 200000, spent: 145000 },
  { name: 'Printing & Stationery', allocated: 80000, spent: 48000 },
  { name: 'Marketing & Promotions', allocated: 120000, spent: 75000 },
  { name: 'Prizes & Mementos', allocated: 180000, spent: 69750 },
];

export default function ReportsPage() {
  const { info } = useToast();

  const totalIncome = 1245000;
  const totalExpense = 759750;
  const netSurplus = totalIncome - totalExpense;

  const handlePrint = () => {
    info('Print Preview', 'Opening print preview dialog...');
    window.print();
  };

  return (
    <Navigation pageTitle="Reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Financial Summary Report</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Summary of total income, expenses, and category budget spending.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>

        {/* 3 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-semibold text-slate-500">Net Surplus / Balance</span>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              Rs. {netSurplus.toLocaleString('en-US')}.00
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-semibold text-slate-500">Total Income</span>
            <div className="text-2xl font-bold text-emerald-600 font-mono">
              Rs. {totalIncome.toLocaleString('en-US')}.00
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-semibold text-slate-500">Total Expenses</span>
            <div className="text-2xl font-bold text-rose-600 font-mono">
              Rs. {totalExpense.toLocaleString('en-US')}.00
            </div>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Spending by Category</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Allocated Budget (LKR)</th>
                  <th className="py-3 px-4 text-right">Actual Spent (LKR)</th>
                  <th className="py-3 px-4 text-right">Remaining (LKR)</th>
                  <th className="py-3 px-4 text-center">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {CATEGORIES_DATA.map((cat, idx) => {
                  const pct = Math.round((cat.spent / cat.allocated) * 100);
                  const rem = cat.allocated - cat.spent;
                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-sans font-semibold text-slate-900">
                        {cat.name}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600">
                        Rs. {cat.allocated.toLocaleString('en-US')}.00
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        Rs. {cat.spent.toLocaleString('en-US')}.00
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-600 font-semibold">
                        Rs. {rem.toLocaleString('en-US')}.00
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700 text-[10px]">
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Navigation>
  );
}
