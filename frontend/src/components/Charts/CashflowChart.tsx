'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface CashflowPoint {
  month: string;
  inflow: number;
  outflow: number;
  net: number;
}

const DEFAULT_CASHFLOW_DATA: CashflowPoint[] = [
  { month: 'Jan', inflow: 180000, outflow: 95000, net: 85000 },
  { month: 'Feb', inflow: 140000, outflow: 120000, net: 20000 },
  { month: 'Mar', inflow: 260000, outflow: 145000, net: 115000 },
  { month: 'Apr', inflow: 190000, outflow: 110000, net: 80000 },
  { month: 'May', inflow: 310000, outflow: 185000, net: 125000 },
  { month: 'Jun', inflow: 220000, outflow: 160000, net: 60000 },
  { month: 'Jul', inflow: 285000, outflow: 135000, net: 150000 },
];

const formatLKR = (val: number) => {
  if (val >= 1000000) return `Rs. ${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `Rs. ${(val / 1000).toFixed(0)}k`;
  return `Rs. ${val}`;
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-700 text-xs space-y-1.5 backdrop-blur-md">
        <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">
          {label} Fiscal Period
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span>
                {entry.name === 'inflow' ? 'Total Inflow (Income)' : 'Total Outflow (Expenses)'}:
              </span>
            </span>
            <span className="font-mono font-bold text-white">
              Rs. {entry.value.toLocaleString('en-US')}.00
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function CashflowChart({ data = DEFAULT_CASHFLOW_DATA }: { data?: CashflowPoint[] }) {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-lg font-bold text-slate-900 tracking-tight">
              Treasury Cashflow Dynamics
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold text-[10px] border border-sky-200">
              FY 2024/25
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time monthly comparison between approved sponsorships & disbursed expenses
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setChartType('area')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              chartType === 'area'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Area Flow
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              chartType === 'bar'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Comparison Bar
          </button>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="inflowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="outflowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284C7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
              />
              <YAxis
                tickFormatter={formatLKR}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 600 }}
                formatter={(value) => (value === 'inflow' ? 'Total Inflow (+)' : 'Total Outflow (-)')}
              />
              <Area
                type="monotone"
                dataKey="inflow"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#inflowGradient)"
              />
              <Area
                type="monotone"
                dataKey="outflow"
                stroke="#0284C7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#outflowGradient)"
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
              />
              <YAxis
                tickFormatter={formatLKR}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 600 }}
                formatter={(value) => (value === 'inflow' ? 'Total Inflow (+)' : 'Total Outflow (-)')}
              />
              <Bar dataKey="inflow" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="outflow" fill="#0284C7" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
