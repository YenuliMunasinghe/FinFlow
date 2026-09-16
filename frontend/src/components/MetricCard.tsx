'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'indigo';
  footerText?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  footerText,
}: MetricCardProps) {
  const variantStyles = {
    default: {
      card: 'border-slate-200/80 bg-white hover:border-slate-300',
      iconBox: 'bg-slate-100 text-slate-800',
      value: 'text-slate-950',
    },
    success: {
      card: 'border-emerald-200/80 bg-emerald-50/20 hover:border-emerald-300',
      iconBox: 'bg-emerald-500/10 text-emerald-600',
      value: 'text-slate-950',
    },
    danger: {
      card: 'border-rose-200/80 bg-rose-50/20 hover:border-rose-300',
      iconBox: 'bg-rose-500/10 text-rose-600',
      value: 'text-slate-950',
    },
    warning: {
      card: 'border-amber-200/80 bg-amber-50/20 hover:border-amber-300',
      iconBox: 'bg-amber-500/10 text-amber-600',
      value: 'text-slate-950',
    },
    indigo: {
      card: 'border-indigo-200/80 bg-indigo-50/20 hover:border-indigo-300',
      iconBox: 'bg-indigo-500/10 text-indigo-600',
      value: 'text-slate-950',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`rounded-2xl p-5 border shadow-xs transition-all duration-200 flex flex-col justify-between card-hover-effect ${style.card}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${style.iconBox}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="my-3">
        <div className={`font-heading text-2xl lg:text-3xl font-extrabold tracking-tight ${style.value}`}>
          {value}
        </div>
        {subtitle && <div className="text-xs text-slate-600 mt-1">{subtitle}</div>}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {trend ? (
          <div className="flex items-center gap-1.5 font-medium">
            <span
              className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold text-[11px] ${
                trend.isPositive
                  ? 'bg-emerald-100/80 text-emerald-700'
                  : 'bg-rose-100/80 text-rose-700'
              }`}
            >
              {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{trend.value}</span>
            </span>
            <span className="text-slate-400 text-[11px]">{trend.label || 'vs last month'}</span>
          </div>
        ) : (
          <span className="text-slate-400 text-[11px]">{footerText || 'Verified by FinFlow'}</span>
        )}
      </div>
    </div>
  );
}
