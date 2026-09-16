'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Light-mode Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-100/60 via-indigo-50/40 to-transparent blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-blue-50/50 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 relative z-10">
        <div className="flex items-center">
          <span className="font-bold text-xl text-slate-900 tracking-tight">
            Fin<span className="text-blue-600">Flow</span>
          </span>
        </div>
        <Link
          href="/login"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow-md hover:shadow-blue-500/20 transition-all"
        >
          Sign In
        </Link>
      </header>

      {/* Main Hero */}
      <main className="max-w-3xl mx-auto w-full text-center space-y-7 my-auto py-10 relative z-10">
        {/* Pill Badge with subtle shadow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 text-blue-700 text-xs font-semibold border border-blue-200/80 shadow-xs shadow-blue-500/5 backdrop-blur-xs">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span>Society Treasury & Accounting</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Simple Financial Management for <span className="text-blue-600">Clubs & Societies</span>
        </h1>

        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Easily track society income, submit expense claims, manage event budgets, and approve payments without complicated setups.
        </p>

        {/* Action Button & Features */}
        <div className="space-y-6">
          <div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>Sign In to Your Society Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
            <div className="p-2.5 rounded-xl bg-white/70 border border-slate-200/60 shadow-xs text-center">
              <div className="text-[11px] font-bold text-slate-800">1-Click Approvals</div>
              <div className="text-[10px] text-slate-500">Fast sign-off flow</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/70 border border-slate-200/60 shadow-xs text-center">
              <div className="text-[11px] font-bold text-slate-800">Event Budgets</div>
              <div className="text-[10px] text-slate-500">Real-time balances</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/70 border border-slate-200/60 shadow-xs text-center">
              <div className="text-[11px] font-bold text-slate-800">Audit Logs</div>
              <div className="text-[10px] text-slate-500">Full transparency</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-slate-400 py-4 border-t border-slate-200/80 relative z-10">
        FinFlow Society Accounting Platform
      </footer>
    </div>
  );
}
