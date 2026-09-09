'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface NavigationProps {
  children: React.ReactNode;
  pageTitle: string;
}

export default function Navigation({ children, pageTitle }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { label: 'Approvals', href: '/approvals', icon: 'verified_user', badge: '3' },
    { label: 'Transactions', href: '/transactions', icon: 'receipt_long' },
    { label: 'Events & Budgets', href: '/events', icon: 'event' },
  ];

  const userDisplayName = user?.name || 'Kavinda Perera';
  const userMemberId = user?.memberId || 'EG/2021/8842';
  const userRole = user?.role || 'PRESIDENT';

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex selection:bg-[#b3d1fd] selection:text-[#3b5a7f]">
      {/* SIDEBAR NAVIGATION */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#0e1c2f] text-white z-50 flex flex-col shadow-xl">
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 bg-white/5">
          <div className="flex flex-col">
            <span className="font-['Hanken_Grotesk'] text-2xl font-bold tracking-tight text-white leading-none">
              Fin<span className="text-[#38BDF8]">Flow</span>
            </span>
            <span className="font-['JetBrains_Mono'] text-[9px] text-[#8fa3bf] uppercase tracking-wider mt-1.5 font-semibold">
              Society Treasury Platform
            </span>
          </div>
        </div>

        {/* Society Scope Badge */}
        <div className="px-4 py-3 bg-white/5 border-b border-white/10">
          <div className="bg-[#1c2d42] p-3 rounded-lg flex items-center justify-between">
            <div className="flex flex-col min-w-0">
              <span className="font-['Inter'] text-[10px] font-bold text-[#8fa3bf] uppercase tracking-wider">
                Engineering Society
              </span>
              <span className="text-xs font-semibold text-white truncate mt-0.5">
                Rotaract & Tech Club
              </span>
            </div>
            <span className="material-symbols-outlined text-[#8fa3bf] text-sm">groups</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-[#77849c] uppercase tracking-wider font-['Inter']">
            Main Navigation
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#38BDF8] text-[#0e1c2f] font-bold shadow-sm'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-[#0e1c2f] text-white' : 'bg-[#ffdad6] text-[#93000a]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* System Tagline & Active User Footer */}
        <div className="p-4 bg-white/5 border-t border-white/10 space-y-3">
          <div className="text-[10px] text-[#8fa3bf] leading-tight font-medium">
            Event-Driven Financial Management & Accounting for University Student Societies
          </div>

          <div className="bg-[#1c2d42] p-3 rounded-lg flex items-center justify-between">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">{userDisplayName}</span>
              <span className="font-['JetBrains_Mono'] text-[10px] text-[#38BDF8] font-semibold">
                {userMemberId} • {userRole}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN LAYOUT WRAPPER */}
      <div className="pl-64 flex flex-col min-h-screen w-full">
        {/* HEADER BAR */}
        <header className="fixed top-0 left-64 right-0 h-16 bg-white shadow-xs z-40 flex items-center justify-between px-8 border-b border-[#c5c6cd]/20">
          <div className="flex items-center gap-3">
            <h1 className="font-['Hanken_Grotesk'] text-lg font-bold text-[#0b1c30]">{pageTitle}</h1>
            <span className="w-1.5 h-1.5 rounded-full bg-[#c5c6cd]"></span>
            <span className="text-xs text-[#44474c] font-medium">Rotaract & Tech Club</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end px-3.5 py-1 bg-[#eff4ff] rounded-lg border border-[#c5c6cd]/20">
              <span className="text-[10px] font-semibold text-[#44474c] uppercase tracking-wider">
                Operating Treasury Balance
              </span>
              <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#0b1c30]">
                Rs. 485,250.00
              </span>
            </div>

            <div className="flex items-center gap-2 pl-2">
              <div className="w-8 h-8 rounded-full bg-[#0e1c2f] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {userDisplayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-[#0b1c30] leading-tight">{userDisplayName}</span>
                <span className="text-[10px] text-[#44474c] font-medium">{userRole}</span>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 px-2.5 py-1 text-xs font-semibold text-[#93000a] bg-[#ffdad6]/50 hover:bg-[#ffdad6] rounded-md transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">logout</span>
                <span>Exit</span>
              </button>
            </div>
          </div>
        </header>

        {/* MAIN BODY CONTENT */}
        <main className="w-full pt-20 px-8 py-6 flex-1 flex flex-col">{children}</main>

        {/* FOOTER */}
        <footer className="w-full bg-[#eff4ff] border-t border-[#c5c6cd]/30 py-3 px-8">
          <div className="flex flex-wrap items-center justify-between text-xs text-[#44474c]">
            <span className="font-['JetBrains_Mono'] text-[11px] font-semibold text-[#426086]">
              FINFLOW SOCIETY TREASURY PLATFORM
            </span>
            <span>Event-Driven Financial Management & Accounting for University Student Societies</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
