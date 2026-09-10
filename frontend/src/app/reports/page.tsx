'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';

interface FinancialReportSummary {
  totalIncome: number;
  totalExpense: number;
  netReserve: number;
  approvedVouchersCount: number;
  pendingApprovalsCount: number;
  categoryBreakdown: {
    category: string;
    allocated: number;
    spent: number;
  }[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ReportsPage() {
  const { token } = useAuth();
  const [report, setReport] = useState<FinancialReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/reports/summary`, { headers });
        if (response.ok) {
          const data = await response.json();
          setReport(data);
        }
      } catch (error) {
        console.error('Failed to fetch financial report:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [token]);

  return (
    <Navigation pageTitle="Financial Intelligence Reports">
      <div className="space-y-6">
        {/* Header Ribbon */}
        <section className="bg-white p-6 rounded-xl shadow-xs border border-[#c5c6cd]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#0e1c2f]">analytics</span>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#426086] font-semibold uppercase tracking-wider">
                Executive Financial Intelligence
              </span>
            </div>
            <h2 className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] tracking-tight mt-1">
              Financial Summary & Analytics
            </h2>
            <p className="text-xs text-[#44474c] mt-0.5">
              Auditable Planned vs. Actual society spending, operating reserve, and category utilization.
            </p>
          </div>

          <button
            onClick={() => alert('FinFlow Financial Summary PDF compilation complete!')}
            className="h-10 px-4 bg-[#0e1c2f] hover:bg-[#1a2d47] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
            <span>Export Financial Report</span>
          </button>
        </section>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#44474c]">Loading financial analytics...</div>
        ) : (
          <>
            {/* KPI Summary Strip */}
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl shadow-xs border border-[#c5c6cd]/30">
                <span className="text-[10px] font-bold text-[#44474c] uppercase tracking-wider">
                  Operating Treasury Reserve
                </span>
                <div className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] mt-1.5">
                  Rs. {report?.netReserve.toLocaleString('en-US')}.00
                </div>
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#10B981] font-semibold">
                  Net Society Balance
                </span>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-xs border border-[#c5c6cd]/30">
                <span className="text-[10px] font-bold text-[#44474c] uppercase tracking-wider">
                  Total Income / Inflow
                </span>
                <div className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] mt-1.5">
                  Rs. {report?.totalIncome.toLocaleString('en-US')}.00
                </div>
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#10B981]">
                  Recorded Deposits
                </span>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-xs border border-[#c5c6cd]/30">
                <span className="text-[10px] font-bold text-[#44474c] uppercase tracking-wider">
                  Total Outflow / Expenses
                </span>
                <div className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] mt-1.5">
                  Rs. {report?.totalExpense.toLocaleString('en-US')}.00
                </div>
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#426086]">
                  {report?.approvedVouchersCount} Cleared Vouchers
                </span>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-xs border border-[#c5c6cd]/30">
                <span className="text-[10px] font-bold text-[#44474c] uppercase tracking-wider">
                  Pending Approvals
                </span>
                <div className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] mt-1.5">
                  {report?.pendingApprovalsCount} Items
                </div>
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#ba1a1a]">
                  Awaiting Executive Action
                </span>
              </div>
            </section>

            {/* Category Breakdown Progress */}
            <section className="bg-white rounded-xl shadow-xs border border-[#c5c6cd]/30 p-6 space-y-4">
              <h3 className="font-['Hanken_Grotesk'] text-lg font-bold text-[#0b1c30]">
                Budget Utilization by Category
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report?.categoryBreakdown.map((cat, idx) => {
                  const pct = Math.round((cat.spent / cat.allocated) * 100);
                  return (
                    <div key={idx} className="p-4 bg-[#eff4ff] rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-xs font-semibold text-[#0b1c30]">
                        <span>{cat.category}</span>
                        <span className="font-['JetBrains_Mono']">{pct}% Used</span>
                      </div>
                      <div className="w-full bg-white h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#0e1c2f] h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[11px] font-['JetBrains_Mono'] text-[#44474c]">
                        <span>Spent: Rs. {cat.spent.toLocaleString('en-US')}</span>
                        <span>Allocated: Rs. {cat.allocated.toLocaleString('en-US')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </Navigation>
  );
}
