'use client';

import React from 'react';
import { useAuth, Role } from '@/context/AuthContext';
import { ShieldCheck, Wallet, UserCheck, Sparkles } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function QuickRoleSwitcher() {
  const { user, switchDemoRole, isDemoMode } = useAuth();
  const { info } = useToast();

  if (!user) return null;

  const handleSwitch = (role: Role, title: string) => {
    switchDemoRole(role);
    info(`Switched to ${title} Perspective`, `You are now viewing FinFlow as a ${role.replace('_', ' ')}.`);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-white/10 shadow-inner">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold text-[10px] tracking-wide border border-cyan-400/30">
          <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
          {isDemoMode ? 'LIVE DEMO ENVIRONMENT' : 'ACTIVE SYSTEM'}
        </span>
        <span className="text-slate-300 hidden sm:inline">
          Switch society role perspective to test Dual-Control Governance:
        </span>
      </div>

      <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-lg border border-white/10">
        <button
          onClick={() => handleSwitch(Role.PRESIDENT, 'President (Kavinda Perera)')}
          className={`px-2.5 py-1 rounded-md font-semibold text-[11px] flex items-center gap-1.5 transition-all ${
            user.role === Role.PRESIDENT
              ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Executive sign-off authority"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>President</span>
        </button>

        <button
          onClick={() => handleSwitch(Role.TREASURER, 'Treasurer (Senuri Silva)')}
          className={`px-2.5 py-1 rounded-md font-semibold text-[11px] flex items-center gap-1.5 transition-all ${
            user.role === Role.TREASURER
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Treasury ledger & disbursements"
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Treasurer</span>
        </button>

        <button
          onClick={() => handleSwitch(Role.COMMITTEE_MEMBER, 'Committee Member (Malith Bandara)')}
          className={`px-2.5 py-1 rounded-md font-semibold text-[11px] flex items-center gap-1.5 transition-all ${
            user.role === Role.COMMITTEE_MEMBER
              ? 'bg-indigo-500 text-white font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Expense claims & event tracking"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Member</span>
        </button>
      </div>
    </div>
  );
}
