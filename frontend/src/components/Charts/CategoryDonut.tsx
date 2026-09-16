'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CategoryShare {
  name: string;
  value: number;
  color: string;
}

const DEFAULT_SHARES: CategoryShare[] = [
  { name: 'Logistics & Audio', value: 180000, color: '#0284C7' },
  { name: 'Venue & Staging', value: 290000, color: '#6366F1' },
  { name: 'Catering & Meals', value: 145000, color: '#10B981' },
  { name: 'Marketing & PR', value: 75000, color: '#F59E0B' },
  { name: 'Awards & Mementos', value: 69750, color: '#EC4899' },
];

export default function CategoryDonut({ data = DEFAULT_SHARES }: { data?: CategoryShare[] }) {
  const totalSpend = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between">
      <div>
        <h3 className="font-heading text-lg font-bold text-slate-900 tracking-tight">
          Expense Allocation Distribution
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Proportion of expenditure by operational category
        </p>
      </div>

      <div className="h-60 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: unknown) => {
                const num = typeof value === 'number' ? value : 0;
                const pct = totalSpend > 0 ? ((num / totalSpend) * 100).toFixed(1) : '0';
                return [`Rs. ${num.toLocaleString('en-US')}.00 (${pct}%)`, 'Spend'];
              }}
              contentStyle={{
                backgroundColor: '#0F172A',
                color: '#fff',
                borderRadius: '0.75rem',
                border: 'none',
                fontSize: '12px',
              }}
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', fontWeight: 500, paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Spend</span>
          <span className="font-mono text-xs font-bold text-slate-800">
            Rs. {(totalSpend / 1000).toFixed(0)}k
          </span>
        </div>
      </div>
    </div>
  );
}
