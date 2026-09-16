'use client';

import React from 'react';
import {
  X,
  Calendar,
  Receipt,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export interface VoucherData {
  id: string;
  refNo: string;
  type: 'INCOME' | 'EXPENSE';
  title: string;
  event: string;
  submitter: string;
  submitterRole?: string;
  category: string;
  amount: number;
  date: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  vendor?: string;
  receiptUrl?: string;
  notes?: string;
}

interface VoucherDetailDrawerProps {
  voucher: VoucherData | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (id: string) => void;
}

export default function VoucherDetailDrawer({
  voucher,
  isOpen,
  onClose,
  onApprove,
}: VoucherDetailDrawerProps) {
  const { info } = useToast();

  if (!isOpen || !voucher) return null;

  const handlePrint = () => {
    info('Generating Voucher Print Preview', `Preparing financial audit voucher #${voucher.refNo}...`);
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white max-w-lg w-full h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div>
          <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-cyan-400/20 text-cyan-300 font-mono text-[10px] font-bold tracking-wider border border-cyan-400/30">
                  OFFICIAL VOUCHER
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    voucher.status === 'APPROVED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : voucher.status === 'PENDING'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                  }`}
                >
                  {voucher.status === 'APPROVED' ? 'CLEARED & SIGNED' : 'PENDING SIGN-OFF'}
                </span>
              </div>
              <h3 className="font-heading text-xl font-bold text-white mt-1.5">
                Voucher #{voucher.refNo}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5">
            {/* Amount Banner */}
            <div
              className={`p-4 rounded-2xl flex items-center justify-between border ${
                voucher.type === 'INCOME'
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-950'
              }`}
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Transaction Amount
                </span>
                <div className="font-mono text-2xl font-bold mt-0.5">
                  {voucher.type === 'INCOME' ? '+' : '-'} Rs. {voucher.amount.toLocaleString('en-US')}.00
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Type</span>
                <div className="text-xs font-bold text-slate-800">
                  {voucher.type === 'INCOME' ? 'Income Deposit' : 'Expense Disbursement'}
                </div>
              </div>
            </div>

            {/* Description & Entity */}
            <div className="space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Item Description
                </span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{voucher.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium">Event Program</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{voucher.event}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium">Category</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{voucher.category}</div>
                </div>
              </div>

              {voucher.vendor && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Vendor / Payee Entity
                  </span>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">{voucher.vendor}</p>
                </div>
              )}
            </div>

            {/* Submitter & Verification */}
            <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-cyan-400 font-bold flex items-center justify-center text-xs">
                    {voucher.submitter.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{voucher.submitter}</div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {voucher.submitterRole || 'Society Committee Member'}
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1 border-t border-sky-100">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Recorded on: {voucher.date}</span>
              </div>
            </div>

            {/* Presidential Digital Stamp Simulation */}
            {voucher.status === 'APPROVED' && (
              <div className="p-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/40 to-teal-50/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-heading text-xs font-bold text-emerald-950 block">
                    Presidential Digital Sign-off Affixed
                  </span>
                  <span className="text-[10px] text-emerald-700 font-mono block">
                    Verified Signature: SHA256:7f83b165...9482
                  </span>
                </div>
              </div>
            )}

            {/* Receipt Preview if available */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Audit Receipt Document
              </span>
              <div className="mt-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <Receipt className="w-4 h-4 text-slate-400" />
                  <span>Invoice_Receipt_{voucher.refNo}.pdf</span>
                </div>
                <button
                  onClick={() => info('Opening Document', 'Receipt document opened in secure viewer.')}
                  className="px-2.5 py-1 text-[11px] font-semibold text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>View</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Voucher</span>
          </button>

          <div className="flex items-center gap-2">
            {voucher.status === 'PENDING' && onApprove && (
              <button
                onClick={() => onApprove(voucher.id)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Approve & Sign</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
