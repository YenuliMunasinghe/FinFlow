'use client';

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Search } from 'lucide-react';

interface AuditItem {
  id: string;
  action: string;
  user: string;
  role: string;
  date: string;
  details: string;
}

const DEFAULT_LOGS: AuditItem[] = [
  {
    id: 'log-1',
    action: 'Approved Transaction',
    user: 'Kavinda Perera',
    role: 'President',
    date: 'Sep 14, 2024 • 10:45 AM',
    details: 'Approved voucher #TRX-089 (Dialog Axiata Sponsorship, Rs. 150,000.00).',
  },
  {
    id: 'log-2',
    action: 'Recorded Income',
    user: 'Senuri Silva',
    role: 'Treasurer',
    date: 'Sep 14, 2024 • 10:24 AM',
    details: 'Recorded deposit from Dialog Axiata PLC for Annual Tech Symposium.',
  },
  {
    id: 'log-3',
    action: 'Submitted Expense',
    user: 'Malith Bandara',
    role: 'Member',
    date: 'Sep 13, 2024 • 04:12 PM',
    details: 'Submitted claim #TRX-088 for Stage Sound & Lighting Rental (Rs. 28,500.00).',
  },
  {
    id: 'log-4',
    action: 'Created Event',
    user: 'Senuri Silva',
    role: 'Treasurer',
    date: 'Sep 10, 2024 • 02:15 PM',
    details: 'Created event "Annual Tech Symposium 2024" with budget Rs. 450,000.00.',
  },
  {
    id: 'log-5',
    action: 'User Registered',
    user: 'Malith Bandara',
    role: 'Member',
    date: 'Sep 08, 2024 • 09:30 AM',
    details: 'Created new account with Member ID: MEM/2023/5021.',
  },
];

export default function AuditLogsPage() {
  const [logs] = useState<AuditItem[]>(DEFAULT_LOGS);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Navigation pageTitle="Audit Logs">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Activity History</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              History of all transaction submissions, approvals, and event updates.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">User & Role</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{log.date}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 font-semibold text-[10px] text-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{log.user}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{log.role}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Navigation>
  );
}
