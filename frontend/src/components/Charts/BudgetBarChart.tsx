'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface CategorySpend {
  category: string;
  allocated: number;
  spent: number;
}

const DEFAULT_CATEGORY_DATA: CategorySpend[] = [
  { category: 'Logistics', allocated: 250000, spent: 180000 },
  { category: 'Venue', allocated: 350000, spent: 290000 },
  { category: 'Catering', allocated: 200000, spent: 145000 },
  { category: 'Marketing', allocated: 120000, spent: 75000 },
  { category: 'Prizes & Mementos', allocated: 180000, spent: 69750 },
];

export default function BudgetBarChart({ data = DEFAULT_CATEGORY_DATA }: { data?: CategorySpend[] }) {
  const formatLKR = (val: number) => `Rs. ${(val / 1000).toFixed(0)}k`;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-bold text-slate-900 tracking-tight">
            Allocated Budget vs Actual Spend
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Category variance to monitor overspending risks
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={formatLKR}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            />
            <YAxis
              type="category"
              dataKey="category"
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
              tick={{ fill: '#1E293B', fontSize: 12, fontWeight: 600 }}
            />
            <Tooltip
              formatter={(value: unknown) => {
                const numericValue = typeof value === 'number' ? value : 0;
                return [`Rs. ${numericValue.toLocaleString('en-US')}.00`, ''];
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
              wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '8px' }}
              formatter={(val) => (val === 'allocated' ? 'Budget Allocated' : 'Actual Spent')}
            />
            <Bar dataKey="allocated" fill="#E2E8F0" radius={[0, 4, 4, 0]} maxBarSize={16} />
            <Bar dataKey="spent" fill="#3B82F6" radius={[0, 4, 4, 0]} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
