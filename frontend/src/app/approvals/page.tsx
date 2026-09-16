'use client';

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { SimpleTransaction } from '@/components/Modals/TransactionDetailModal';
import { Check, XCircle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useAuth, Role } from '@/context/AuthContext';

const INITIAL_PENDING: SimpleTransaction[] = [
  {
    id: 'queue-1',
    refNo: 'TRX-088',
    title: 'Stage Sound & Lighting Rental',
    type: 'EXPENSE',
    amount: 28500,
    category: 'Logistics',
    event: 'Annual Tech Symposium 2024',
    date: 'Sep 13, 2024',
    status: 'PENDING',
    submitter: 'Malith Bandara (Logistics Head)',
    vendor: 'Sonic Pro Audio (Pvt) Ltd',
  },
  {
    id: 'queue-2',
    refNo: 'TRX-084',
    title: 'Venue Security & Cleaning Surcharge',
    type: 'EXPENSE',
    amount: 20000,
    category: 'Venue',
    event: 'Annual Tech Symposium 2024',
    date: 'Sep 02, 2024',
    status: 'PENDING',
    submitter: 'Malith Bandara (Logistics Head)',
    vendor: 'University Premises Operations',
  },
  {
    id: 'queue-3',
    refNo: 'TRX-082',
    title: 'Social Media Promo Videos & Standees',
    type: 'EXPENSE',
    amount: 14000,
    category: 'Marketing',
    event: 'Inter-University Hackathon 2024',
    date: 'Aug 29, 2024',
    status: 'PENDING',
    submitter: 'Chamari Atapattu (PR Coordinator)',
    vendor: 'PixelCraft Studios',
  },
];

export default function ApprovalsPage() {
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const [pendingList, setPendingList] = useState<SimpleTransaction[]>(INITIAL_PENDING);

  const isPresident = user?.role === Role.PRESIDENT;

  const handleApprove = (id: string, title: string) => {
    if (!isPresident) {
      error('Access Denied', 'Only the Society President is authorized to approve transactions.');
      return;
    }
    setPendingList((prev) => prev.filter((item) => item.id !== id));
    success('Approved', `"${title}" has been approved.`);
  };

  const handleReject = (id: string, title: string) => {
    if (!isPresident) {
      error('Access Denied', 'Only the Society President is authorized to reject transactions.');
      return;
    }
    setPendingList((prev) => prev.filter((item) => item.id !== id));
    error('Rejected', `"${title}" has been rejected.`);
  };

  const handleApproveAll = () => {
    if (!isPresident) {
      error('Access Denied', 'Only the Society President is authorized to approve transactions.');
      return;
    }
    const count = pendingList.length;
    setPendingList([]);
    success('All Approved', `Approved ${count} pending transactions.`);
  };

  const totalPendingAmount = pendingList.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Navigation pageTitle="Approvals">
      <div className="space-y-6">
        {/* Permission Banner if not President */}
        {!isPresident && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-900 shadow-xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <strong className="font-bold">President Authorization Required:</strong> Only the Society President is authorized to approve or reject financial requests. You are signed in as <strong className="capitalize">{user?.role?.toLowerCase().replace('_', ' ') || 'Member'}</strong> (View Only).
            </div>
          </div>
        )}

        {/* Header Ribbon */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Pending Approvals Queue</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and approve submitted expense claims and financial requests.
            </p>
          </div>

          {isPresident && pendingList.length > 0 && (
            <button
              onClick={handleApproveAll}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Approve All ({pendingList.length})</span>
            </button>
          )}
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500">Pending Requests</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {pendingList.length} Item{pendingList.length === 1 ? '' : 's'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500">Total Pending Amount</span>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
                Rs. {totalPendingAmount.toLocaleString('en-US')}.00
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Pending Items List / Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Awaiting Decision</h3>
          </div>

          {pendingList.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-slate-900">All clear!</h4>
              <p className="text-xs text-slate-500">No pending transactions waiting for review.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Ref</th>
                    <th className="py-3 px-4">Title & Event</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Submitted By</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Amount (LKR)</th>
                    <th className="py-3 px-4 text-center">Status / Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-slate-500">
                        #{item.refNo}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">{item.title}</div>
                        <div className="text-[11px] text-slate-500">{item.event}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-800">
                        {item.submitter || 'Member'}
                      </td>
                      <td className="py-4 px-4 text-slate-500">{item.date}</td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                        Rs. {item.amount.toLocaleString('en-US')}.00
                      </td>
                      <td className="py-4 px-4 text-center">
                        {isPresident ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleReject(item.id, item.title)}
                              className="px-3 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                            <button
                              onClick={() => handleApprove(item.id, item.title)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-[10px]">
                            Awaiting President
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Navigation>
  );
}
