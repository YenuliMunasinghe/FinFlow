'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [activePeriod, setActivePeriod] = useState<'annual' | 'q1' | 'month'>('annual');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('FinFlow Executive Summary PDF compilation complete!');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col justify-between selection:bg-[#b3d1fd] selection:text-[#3b5a7f]">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#0e1c2f] text-white z-50 flex flex-col shadow-lg">
        {/* Brand Header */}
        <div className="p-4 flex items-center justify-between bg-white/5 border-b border-white/10">
          <div className="flex flex-col">
            <span className="font-['Hanken_Grotesk'] text-xl font-bold tracking-tight text-white leading-none">
              Fin<span className="text-[#38BDF8]">Flow</span>
            </span>
            <span className="font-['JetBrains_Mono'] text-[9px] text-[#77849c] uppercase tracking-wider mt-1">
              Society Treasury
            </span>
          </div>
        </div>

        {/* Active Society Scope */}
        <div className="px-4 py-3 bg-white/5 border-b border-white/10">
          <div className="bg-[#1c2d42] p-3 rounded-lg flex items-center justify-between">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="font-['Inter'] text-[10px] font-bold text-[#77849c] uppercase truncate">
                Engineering Society
              </span>
              <span className="text-xs font-semibold text-white truncate">
                Rotaract & Tech Club
              </span>
            </div>
            <span className="material-symbols-outlined text-[#77849c] text-sm">unfold_more</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <nav className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold text-[#77849c] uppercase tracking-wider font-['Inter']">
              Overview
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#dce9ff] text-[#0b1c30] font-semibold text-xs transition-colors"
            >
              <span className="material-symbols-outlined text-sm">dashboard</span>
              <span>Dashboard</span>
            </Link>
          </nav>

          <nav className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold text-[#77849c] uppercase tracking-wider font-['Inter']">
              Cashflow & Transactions
            </div>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/80 hover:bg-white/10 text-xs font-medium transition-colors">
              <span className="material-symbols-outlined text-sm">receipt_long</span>
              <span>Transactions</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/80 hover:bg-white/10 text-xs font-medium transition-colors">
              <span className="material-symbols-outlined text-sm">south_west</span>
              <span>Income Management</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/80 hover:bg-white/10 text-xs font-medium transition-colors">
              <span className="material-symbols-outlined text-sm">north_east</span>
              <span>Expense Management</span>
            </a>
          </nav>

          <nav className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold text-[#77849c] uppercase tracking-wider font-['Inter']">
              Governance & Control
            </div>
            <Link href="/approvals" className="flex items-center justify-between px-3 py-2 rounded-lg text-white/80 hover:bg-white/10 text-xs font-medium transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span>Approvals</span>
              </div>
              <span className="bg-[#ffdad6] text-[#93000a] text-[10px] font-bold px-2 py-0.5 rounded-full">
                3 Pending
              </span>
            </Link>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/80 hover:bg-white/10 text-xs font-medium transition-colors">
              <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
              <span>Budget Allocations</span>
            </a>
          </nav>
        </div>

        {/* Viewing Role Footer */}
        <div className="p-3 bg-white/5 border-t border-white/10">
          <div className="bg-[#1c2d42] p-3 rounded-lg flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#77849c] uppercase">Viewing As</span>
              <span className="bg-[#b3d1fd] text-[#3b5a7f] text-[10px] font-bold px-2 py-0.5 rounded-full">Executive</span>
            </div>
            <div className="flex items-center justify-between text-white text-xs font-semibold">
              <span>Society President</span>
              <span className="material-symbols-outlined text-xs text-[#77849c]">swap_horiz</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="pl-64 flex flex-col min-h-screen">
        
        {/* HEADER BAR */}
        <header className="fixed top-0 left-64 right-0 h-16 bg-white/90 backdrop-blur-md shadow-xs z-40 flex items-center justify-between px-6 border-b border-[#c5c6cd]/20">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#44474c] text-base">search</span>
              <input
                type="text"
                placeholder="Search vouchers, ledgers, events..."
                className="w-full h-9 pl-10 pr-4 bg-[#eff4ff] rounded-lg text-xs text-[#0b1c30] placeholder:text-[#44474c] focus:outline-none focus:ring-1 focus:ring-[#426086]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end px-3 py-1 bg-[#eff4ff] rounded-lg">
              <span className="text-[10px] font-semibold text-[#44474c] uppercase">Society Balance</span>
              <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#0b1c30]">Rs. 485,250.00</span>
            </div>
            <div className="flex items-center gap-2 pl-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-[#0e1c2f] text-white flex items-center justify-center text-xs font-bold">
                KP
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-[#0b1c30] leading-tight">Kavinda Perera</span>
                <span className="text-[10px] text-[#44474c]">Society President</span>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY DASHBOARD */}
        <main className="w-full pt-20 px-6 py-6 flex-1 flex flex-col space-y-6">
          
          {/* Executive Header Banner */}
          <section className="w-full bg-white p-6 rounded-xl shadow-sm border border-[#c5c6cd]/30 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#426086] font-semibold uppercase tracking-wider">
                  Engineering Rotaract & Tech Society
                </span>
                <span className="w-1 h-1 rounded-full bg-[#c5c6cd]"></span>
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#44474c]">FY 2024/2025</span>
              </div>
              <h1 className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] tracking-tight">
                Welcome back, Kavinda!
              </h1>
              <p className="text-xs text-[#44474c]">
                Here is your society financial summary and active ledger state for the current semester.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex p-1 bg-[#eff4ff] rounded-lg">
                {(['annual', 'q1', 'month'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setActivePeriod(period)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                      activePeriod === period
                        ? 'bg-white text-[#0b1c30] shadow-sm'
                        : 'text-[#44474c] hover:text-[#0b1c30]'
                    }`}
                  >
                    {period === 'annual' ? 'Annual' : period === 'q1' ? 'Q1' : 'This Month'}
                  </button>
                ))}
              </div>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="h-9 px-4 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-base text-[#426086]">picture_as_pdf</span>
                <span>{isExporting ? 'Exporting...' : 'Export Summary'}</span>
              </button>
            </div>
          </section>

          {/* Primary KPI Cards (4 Grid) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            
            {/* KPI 1: Inflow */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-[#c5c6cd]/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#44474c] uppercase tracking-wider">Total Income / Inflow</span>
                <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#426086]">
                  <span className="material-symbols-outlined text-base">south_west</span>
                </div>
              </div>
              <div className="my-3">
                <div className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] tracking-tight">
                  Rs. 1,245,000.00
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] text-[11px] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">trending_up</span> +18.4%
                  </span>
                  <span className="text-xs text-[#44474c]">vs last term</span>
                </div>
              </div>
              <div className="font-['JetBrains_Mono'] text-[11px] text-[#426086]">Sponsorships & Member Dues</div>
            </div>

            {/* KPI 2: Outflow */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-[#c5c6cd]/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#44474c] uppercase tracking-wider">Total Expenses / Outflow</span>
                <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#ba1a1a]">
                  <span className="material-symbols-outlined text-base">north_east</span>
                </div>
              </div>
              <div className="my-3">
                <div className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] tracking-tight">
                  Rs. 759,750.00
                </div>
                <div className="text-xs text-[#44474c] mt-1">Approved disbursements</div>
              </div>
              <div className="font-['JetBrains_Mono'] text-[11px] text-[#44474c]">Logistics: 65% • Ops: 25%</div>
            </div>

            {/* KPI 3: Net Operating Balance */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-[#c5c6cd]/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#44474c] uppercase tracking-wider">Net Operating Balance</span>
                <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#0e1c2f]">
                  <span className="material-symbols-outlined text-base">account_balance</span>
                </div>
              </div>
              <div className="my-3">
                <div className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] tracking-tight">
                  Rs. 485,250.00
                </div>
                <div className="font-['JetBrains_Mono'] text-[11px] text-[#44474c] mt-1">Society Treasury Reserve</div>
              </div>
              <div className="p-2 bg-[#eff4ff] rounded text-[11px] font-['JetBrains_Mono'] flex justify-between">
                <span>Bank A/C: Rs. 460,250.00</span>
                <span>Petty: Rs. 25,000</span>
              </div>
            </div>

            {/* KPI 4: Pending Approvals */}
            <div className="bg-[#ffdad6]/40 p-5 rounded-xl shadow-sm border border-[#ba1a1a]/20 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#93000a] uppercase tracking-wider">Pending Sign-offs</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] animate-pulse"></span>
              </div>
              <div className="my-3">
                <div className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30]">3 Requests</div>
                <div className="font-['JetBrains_Mono'] text-xs font-semibold text-[#93000a] mt-1">
                  Rs. 62,500.00 Pending Release
                </div>
              </div>
              <button className="w-full py-2 bg-[#0e1c2f] text-white hover:bg-[#1a2d47] rounded-lg text-xs font-semibold transition-colors shadow-sm">
                Review Approvals
              </button>
            </div>

          </section>

          {/* Workflow Stepper Card */}
          <section className="w-full bg-white p-6 rounded-xl shadow-sm border border-[#c5c6cd]/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-['Hanken_Grotesk'] text-lg font-semibold text-[#0b1c30]">Society Transaction Workflow</h2>
                <p className="text-xs text-[#44474c]">Standard Operating Procedure for Society Financial Management</p>
              </div>
              <div className="flex items-center gap-1 font-['JetBrains_Mono'] text-xs text-[#426086]">
                <span className="material-symbols-outlined text-base">verified</span>
                <span>Dual Approval Protection Active</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-[#eff4ff] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#dce9ff] text-[#0b1c30] font-bold text-xs flex items-center justify-center">01</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-[#44474c]">Draft</span>
                </div>
                <div className="text-xs font-bold text-[#0b1c30]">1. Transaction Submission</div>
                <p className="text-[11px] text-[#44474c]">Committee member logs expense/income request with supporting receipts.</p>
              </div>

              <div className="p-4 rounded-lg bg-[#b3d1fd]/30 space-y-2 border border-[#426086]/20">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#426086] text-white font-bold text-xs flex items-center justify-center">02</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#b3d1fd] text-[#3b5a7f]">3 Active</span>
                </div>
                <div className="text-xs font-bold text-[#0b1c30]">2. President Review</div>
                <p className="text-[11px] text-[#44474c]">President checks budget variance and signs off or requests revision.</p>
              </div>

              <div className="p-4 rounded-lg bg-[#eff4ff] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#0e1c2f] text-white font-bold text-xs flex items-center justify-center">03</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-[#44474c]">Cleared</span>
                </div>
                <div className="text-xs font-bold text-[#0b1c30]">3. Treasurer Disbursement</div>
                <p className="text-[11px] text-[#44474c]">Treasurer executes payment and posts transaction to general ledger.</p>
              </div>

              <div className="p-4 rounded-lg bg-[#eff4ff] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#c5c6cd] text-[#0b1c30] font-bold text-xs flex items-center justify-center">04</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-[#44474c]">Audit Log</span>
                </div>
                <div className="text-xs font-bold text-[#0b1c30]">4. Immutable Audit Log</div>
                <p className="text-[11px] text-[#44474c]">Immutable trail recorded for permanent society audit trail.</p>
              </div>
            </div>
          </section>

          {/* Recent Transactions & Actions (Split Layout) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Table Column */}
            <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-[#c5c6cd]/30 overflow-hidden">
              <div className="p-5 border-b border-[#c5c6cd]/20 flex items-center justify-between">
                <div>
                  <h2 className="font-['Hanken_Grotesk'] text-lg font-semibold text-[#0b1c30]">Recent Society Transactions</h2>
                  <p className="text-xs text-[#44474c]">Recorded journal log for active society accounts</p>
                </div>
                <button className="px-3 py-1.5 bg-[#eff4ff] text-[#0b1c30] text-xs font-semibold rounded-lg hover:bg-[#dce9ff] transition-colors">
                  View All Entries
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#eff4ff] text-[#44474c] uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="p-3">Ref / Date</th>
                      <th className="p-3">Description & Event</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Amount (LKR)</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c5c6cd]/20">
                    <tr className="hover:bg-[#eff4ff]/50">
                      <td className="p-3 font-['JetBrains_Mono']">
                        <div className="font-bold text-[#0b1c30]">#TRX-2024-089</div>
                        <div className="text-[10px] text-[#44474c]">Jun 18 • 10:24 AM</div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-[#0b1c30]">Dialog Axiata Sponsorship</div>
                        <div className="text-[11px] text-[#44474c]">Annual Tech Symposium 2024</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] font-semibold text-[10px]">
                          Sponsorship
                        </span>
                      </td>
                      <td className="p-3 text-right font-['JetBrains_Mono'] font-bold text-[#10B981]">
                        + Rs. 150,000.00
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-[#e5eeff] text-[#0b1c30] font-semibold text-[10px]">
                          Approved
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-[#eff4ff]/50 bg-[#eff4ff]/30">
                      <td className="p-3 font-['JetBrains_Mono']">
                        <div className="font-bold text-[#0b1c30]">#TRX-2024-088</div>
                        <div className="text-[10px] text-[#44474c]">Jun 17 • 04:12 PM</div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-[#0b1c30]">Stage Sound & Lights Rental</div>
                        <div className="text-[11px] text-[#44474c]">Electro Sound Systems (Pvt) Ltd</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#44474c] font-semibold text-[10px]">
                          Logistics
                        </span>
                      </td>
                      <td className="p-3 text-right font-['JetBrains_Mono'] font-bold text-[#ba1a1a]">
                        - Rs. 35,000.00
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] font-bold text-[10px]">
                          Pending Sign-off
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions Right Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-[#c5c6cd]/30 space-y-4">
                <div>
                  <h3 className="font-['Hanken_Grotesk'] text-base font-bold text-[#0b1c30]">Quick Actions</h3>
                  <p className="text-xs text-[#44474c]">Execute treasury operations</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-left transition-colors space-y-1">
                    <span className="material-symbols-outlined text-[#0e1c2f] text-lg">add_card</span>
                    <div className="text-xs font-bold text-[#0b1c30]">New Expense</div>
                    <div className="text-[10px] text-[#44474c]">Submit request</div>
                  </button>
                  <button className="p-3 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-left transition-colors space-y-1">
                    <span className="material-symbols-outlined text-[#426086] text-lg">receipt</span>
                    <div className="text-xs font-bold text-[#0b1c30]">Add Income</div>
                    <div className="text-[10px] text-[#44474c]">Record deposit</div>
                  </button>
                </div>
              </div>
            </div>

          </section>

        </main>

        {/* Footer */}
        <footer className="w-full bg-[#eff4ff] border-t border-[#c5c6cd]/30 py-3 px-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#44474c]">
            <span className="font-['JetBrains_Mono'] text-[11px]">FINFLOW SYSTEM INSTANCE #ENG-SOC-01</span>
            <span>FinFlow — Student Society Accounting System</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
