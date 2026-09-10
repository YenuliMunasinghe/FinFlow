'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';

interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  user: string;
  role: string;
  timestamp: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AuditLogsPage() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/audit-logs`, { headers });
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [token]);

  const filtered = logs.filter((log) => {
    const matchesFilter = filter === 'ALL' ? true : log.action === filter;
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <Navigation pageTitle="Immutable Audit Logs">
      <div className="space-y-6">
        {/* Header Ribbon */}
        <section className="bg-white p-6 rounded-xl shadow-xs border border-[#c5c6cd]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#0e1c2f]">history</span>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#426086] font-semibold uppercase tracking-wider">
                System Governance & Audit Security
              </span>
            </div>
            <h2 className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] tracking-tight mt-1">
              Immutable Audit Trail
            </h2>
            <p className="text-xs text-[#44474c] mt-0.5">
              Permanent, tamper-evident log of all financial sign-offs, transaction entries, and user provisioning actions.
            </p>
          </div>

          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#44474c] text-base">
              search
            </span>
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-[#eff4ff] rounded-lg text-xs text-[#0b1c30] placeholder:text-[#44474c] focus:outline-none focus:ring-1 focus:ring-[#426086]"
            />
          </div>
        </section>

        {/* Audit Log Table Card */}
        <section className="bg-white rounded-xl shadow-xs border border-[#c5c6cd]/30 overflow-hidden">
          <div className="p-4 border-b border-[#c5c6cd]/20 flex flex-wrap items-center justify-between gap-3 bg-[#f8f9ff]/50">
            <div className="inline-flex p-1 bg-[#eff4ff] rounded-lg text-xs">
              {(['ALL', 'VOUCHER_SIGN_OFF', 'TRANSACTION_SUBMITTED', 'EVENT_CREATED', 'USER_REGISTERED'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 font-semibold rounded-md transition-all ${
                    filter === tab
                      ? 'bg-white text-[#0b1c30] shadow-xs'
                      : 'text-[#44474c] hover:text-[#0b1c30]'
                  }`}
                >
                  {tab === 'ALL'
                    ? 'All Logs'
                    : tab === 'VOUCHER_SIGN_OFF'
                    ? 'Sign-offs'
                    : tab === 'TRANSACTION_SUBMITTED'
                    ? 'Submissions'
                    : tab === 'EVENT_CREATED'
                    ? 'Events'
                    : 'User Events'}
                </button>
              ))}
            </div>

            <span className="font-['JetBrains_Mono'] text-xs text-[#426086] font-semibold">
              Showing {filtered.length} of {logs.length} audit entries
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-xs text-[#44474c]">Loading audit log trail...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#eff4ff] text-[#44474c] uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Action Type</th>
                    <th className="p-4">User & Role</th>
                    <th className="p-4">Details & Target Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c5c6cd]/20 font-['JetBrains_Mono']">
                  {filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-[#eff4ff]/50 transition-colors">
                      <td className="p-4 text-[11px] text-[#44474c] whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            log.action === 'VOUCHER_SIGN_OFF'
                              ? 'bg-[#10B981]/10 text-[#10B981]'
                              : log.action === 'TRANSACTION_SUBMITTED'
                              ? 'bg-[#eff4ff] text-[#426086]'
                              : 'bg-purple-50 text-purple-700'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-[#0b1c30] font-['Inter']">
                        <div>{log.user}</div>
                        <span className="text-[10px] text-[#426086] font-['JetBrains_Mono'] font-bold">
                          {log.role}
                        </span>
                      </td>
                      <td className="p-4 font-['Inter'] text-[#0b1c30]">
                        <div className="text-xs font-semibold">{log.details || 'No additional details.'}</div>
                        {log.entityId && (
                          <div className="font-['JetBrains_Mono'] text-[10px] text-[#426086] mt-0.5">
                            Target Entity: #{log.entityId}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </Navigation>
  );
}
