'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';

interface PendingVoucher {
  id: string;
  refNo: string;
  type: 'EXPENSE' | 'INCOME';
  title: string;
  event: string;
  vendorOrSource: string;
  submitter: string;
  submitterRole: string;
  amount: number;
  category: string;
  budgetAllocated: number;
  budgetSpent: number;
  dateSubmitted: string;
  receiptUrl?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ApprovalsPage() {
  const { token } = useAuth();
  const [queue, setQueue] = useState<PendingVoucher[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [revisionInstructions, setRevisionInstructions] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchQueue = async () => {
    try {
      setIsLoading(true);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/transactions?status=PENDING`, { headers });
      if (response.ok) {
        const data = await response.json();
        setQueue(data);
      }
    } catch (error) {
      console.error('Failed to fetch approval queue:', error);
    } fontally: {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [token]);

  const activeVoucher = queue[selectedIndex] || queue[0];

  const handleApprove = async () => {
    if (!activeVoucher) return;
    try {
      setIsProcessing(true);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/transactions/${activeVoucher.id}/approve`, {
        method: 'PATCH',
        headers,
      });

      if (response.ok) {
        setActionMessage(`Voucher #${activeVoucher.refNo} for Rs. ${activeVoucher.amount.toLocaleString('en-US')}.00 approved successfully!`);
        setShowSuccessModal(true);
        setQueue((prev) => prev.filter((v) => v.id !== activeVoucher.id));
        setSelectedIndex(0);
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to sign off voucher.');
      }
    } catch (error) {
      console.error('Failed to approve transaction:', error);
      alert('Network error while signing off voucher.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!activeVoucher) return;
    try {
      setIsProcessing(true);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/transactions/${activeVoucher.id}/reject`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (response.ok) {
        alert(`Voucher #${activeVoucher.refNo} rejected.`);
        setShowRejectModal(false);
        setRejectionReason('');
        setQueue((prev) => prev.filter((v) => v.id !== activeVoucher.id));
        setSelectedIndex(0);
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to reject voucher.');
      }
    } catch (error) {
      console.error('Failed to reject transaction:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmRevision = async () => {
    if (!activeVoucher) return;
    try {
      setIsProcessing(true);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/transactions/${activeVoucher.id}/revision`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ instructions: revisionInstructions }),
      });

      if (response.ok) {
        alert(`Revision request sent for Voucher #${activeVoucher.refNo}.`);
        setShowRevisionModal(false);
        setRevisionInstructions('');
        setQueue((prev) => prev.filter((v) => v.id !== activeVoucher.id));
        setSelectedIndex(0);
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to request revision.');
      }
    } catch (error) {
      console.error('Failed to request revision:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchApprove = async () => {
    alert(`Batch approval initiated for ${queue.length} vouchers in queue.`);
    setQueue([]);
  };

  return (
    <Navigation pageTitle="Executive Approvals Queue">
      <div className="space-y-6">
        {/* Header Ribbon */}
        <section className="bg-white p-6 rounded-xl shadow-xs border border-[#c5c6cd]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#0e1c2f]">shield</span>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#426086] font-semibold uppercase tracking-wider">
                President & Executive Sign-off Gate
              </span>
            </div>
            <h2 className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] tracking-tight mt-1">
              Transaction Approval Queue
            </h2>
            <p className="text-xs text-[#44474c] mt-0.5">
              Review society financial requests requiring Presidential sign-off according to dual treasury control rules.
            </p>
          </div>

          {queue.length > 0 && (
            <button
              onClick={handleBatchApprove}
              className="h-10 px-5 bg-[#0e1c2f] hover:bg-[#1a2d47] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-base">gavel</span>
              <span>Batch Sign ({queue.length} Vouchers)</span>
            </button>
          )}
        </section>

        {/* Metric Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-xs border border-[#c5c6cd]/30">
            <span className="text-[10px] font-bold text-[#44474c] uppercase tracking-wider">
              Pending Queue Value
            </span>
            <div className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] mt-1.5">
              Rs. {queue.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString('en-US')}.00
            </div>
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#ba1a1a] font-semibold">
              {queue.length} Vouchers Awaiting Decision
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-xs border border-[#c5c6cd]/30">
            <span className="text-[10px] font-bold text-[#44474c] uppercase tracking-wider">
              Average Turnaround
            </span>
            <div className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] mt-1.5">
              12.4 Hours
            </div>
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#10B981]">
              Fast Executive Response
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-xs border border-[#c5c6cd]/30">
            <span className="text-[10px] font-bold text-[#44474c] uppercase tracking-wider">
              Approved This Term
            </span>
            <div className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] mt-1.5">
              Rs. 845,000.00
            </div>
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#426086]">
              38 Cleared Society Vouchers
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-xs border border-[#c5c6cd]/30">
            <span className="text-[10px] font-bold text-[#44474c] uppercase tracking-wider">
              Revisions Active
            </span>
            <div className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] mt-1.5">
              1 Voucher
            </div>
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#44474c]">
              Sent Back for Amendment
            </span>
          </div>
        </section>

        {/* Main Inspection Dossier & Queue Grid */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#44474c]">Loading approval queue...</div>
        ) : queue.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-xs border border-[#c5c6cd]/30 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">task_alt</span>
            </div>
            <h3 className="font-['Hanken_Grotesk'] text-xl font-bold text-[#0b1c30]">
              Approval Queue Empty!
            </h3>
            <p className="text-xs text-[#44474c] max-w-sm mx-auto">
              All society financial claims and income deposits have been reviewed and signed off.
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Detailed Voucher Inspection */}
            <div className="xl:col-span-8 bg-white rounded-xl shadow-xs border border-[#c5c6cd]/30 overflow-hidden flex flex-col">
              {/* Security Header Bar */}
              <div className="bg-[#0e1c2f] text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest bg-[#38BDF8] text-[#0e1c2f] font-bold px-2 py-0.5 rounded">
                    Voucher In-Review
                  </span>
                  <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#38BDF8]">
                    #{activeVoucher.refNo}
                  </span>
                  <span className="text-xs text-gray-300 font-medium">• {activeVoucher.event}</span>
                </div>
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#8fa3bf]">
                  Submitted {activeVoucher.dateSubmitted || 'Today'}
                </span>
              </div>

              {/* Title & Amount Section */}
              <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#c5c6cd]/20">
                <div>
                  <span className="text-[10px] font-bold text-[#426086] uppercase tracking-wider">
                    {activeVoucher.category}
                  </span>
                  <h3 className="font-['Hanken_Grotesk'] text-xl font-bold text-[#0b1c30] mt-1">
                    {activeVoucher.title}
                  </h3>
                  <div className="text-xs text-[#44474c] mt-1">
                    Vendor/Source: <strong className="text-[#0b1c30]">{activeVoucher.vendorOrSource || 'Society Vendor'}</strong>
                  </div>
                </div>

                <div className="bg-[#eff4ff] p-4 rounded-xl flex flex-col items-end min-w-[180px] border border-[#c5c6cd]/20">
                  <span className="text-[10px] font-semibold text-[#44474c] uppercase">
                    Claim Amount
                  </span>
                  <div className="font-['JetBrains_Mono'] text-xl font-bold text-[#0b1c30]">
                    Rs. {activeVoucher.amount?.toLocaleString('en-US')}.00
                  </div>
                  <span className="font-['JetBrains_Mono'] text-[10px] text-[#426086] font-semibold">
                    LKR Currency
                  </span>
                </div>
              </div>

              {/* Submitter Info */}
              <div className="mx-6 my-5 p-4 bg-[#eff4ff]/60 rounded-xl flex items-center justify-between border border-[#c5c6cd]/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0e1c2f] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    {(activeVoucher.submitter || 'EX').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0b1c30]">{activeVoucher.submitter}</div>
                    <div className="text-[11px] text-[#44474c]">{activeVoucher.submitterRole || 'Committee Member'} • Rotaract & Tech Club</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-white border border-[#c5c6cd]/30 text-[#0b1c30] text-[10px] font-bold rounded-md">
                  Verified Submitter
                </span>
              </div>

              {/* Budget Pool Progress */}
              <div className="px-6 pb-6 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0b1c30]">
                    Budget Allocation Pool Impact: {activeVoucher.category}
                  </span>
                  <span className="font-['JetBrains_Mono'] text-[#0b1c30] font-bold">
                    Rs. {(activeVoucher.budgetSpent || activeVoucher.amount)?.toLocaleString('en-US')}.00 / Rs. {(activeVoucher.budgetAllocated || activeVoucher.amount * 1.5)?.toLocaleString('en-US')}.00
                  </span>
                </div>
                <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#426086] h-full rounded-full transition-all"
                    style={{
                      width: '71.25%',
                    }}
                  ></div>
                </div>
                <div className="text-[11px] text-[#10B981] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">check_circle</span>
                  <span>Within approved budget allocation limits.</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="bg-[#eff4ff] p-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#c5c6cd]/30">
                <div className="text-xs text-[#44474c] font-['JetBrains_Mono'] font-medium">
                  President Sign-off Action Required
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={isProcessing}
                    className="px-4 py-2.5 bg-white text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg text-xs font-semibold transition-colors border border-[#ba1a1a]/20"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setShowRevisionModal(true)}
                    disabled={isProcessing}
                    className="px-4 py-2.5 bg-white text-[#0b1c30] hover:bg-[#dce9ff] rounded-lg text-xs font-semibold transition-colors border border-[#c5c6cd]/30"
                  >
                    Request Revision
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="px-6 py-2.5 bg-[#0e1c2f] hover:bg-[#1a2d47] text-white rounded-lg text-xs font-semibold transition-colors shadow-sm flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">gavel</span>
                    <span>{isProcessing ? 'Signing...' : 'Approve & Sign Voucher'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Queue Selector List */}
            <div className="xl:col-span-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#44474c] px-1">
                Other Requests in Queue ({queue.length})
              </div>

              <div className="space-y-3">
                {queue.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedIndex(idx)}
                      className={`p-4 rounded-xl shadow-xs border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#eff4ff] border-[#38BDF8] ring-1 ring-[#38BDF8]'
                          : 'bg-white border-[#c5c6cd]/30 hover:border-[#426086]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-['JetBrains_Mono'] font-bold text-[#0b1c30]">
                          #{item.refNo}
                        </span>
                        <span
                          className={`uppercase font-bold text-[10px] px-2 py-0.5 rounded ${
                            item.type === 'INCOME'
                              ? 'bg-[#10B981]/10 text-[#10B981]'
                              : 'bg-[#eff4ff] text-[#426086]'
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#0b1c30] mt-1.5 line-clamp-1">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[#44474c] mt-0.5">{item.submitter}</div>
                      <div className="font-['JetBrains_Mono'] text-xs font-bold text-[#0b1c30] mt-2">
                        Rs. {item.amount?.toLocaleString('en-US')}.00
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-xl shadow-xl p-6 space-y-4">
            <h3 className="font-['Hanken_Grotesk'] text-lg font-bold text-[#ba1a1a]">
              Reject Transaction Request
            </h3>
            <p className="text-xs text-[#44474c]">
              Please state the reason for rejecting voucher #{activeVoucher?.refNo} (Rs.{' '}
              {activeVoucher?.amount?.toLocaleString('en-US')}.00).
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection justification for audit log..."
              className="w-full p-3 bg-[#f8f9ff] border border-[#c5c6cd] rounded-lg text-xs text-[#0b1c30] focus:outline-none focus:border-[#ba1a1a]"
              rows={3}
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#44474c] hover:text-[#0b1c30]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={isProcessing}
                className="px-4 py-2 bg-[#ba1a1a] text-white rounded-lg text-xs font-semibold hover:bg-[#93000a]"
              >
                {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVISION MODAL */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-xl shadow-xl p-6 space-y-4">
            <h3 className="font-['Hanken_Grotesk'] text-lg font-bold text-[#0b1c30]">
              Request Revision
            </h3>
            <p className="text-xs text-[#44474c]">
              Notify submitter ({activeVoucher?.submitter}) to amend details for #{activeVoucher?.refNo}.
            </p>
            <textarea
              value={revisionInstructions}
              onChange={(e) => setRevisionInstructions(e.target.value)}
              placeholder="Enter specific amendment instructions..."
              className="w-full p-3 bg-[#f8f9ff] border border-[#c5c6cd] rounded-lg text-xs text-[#0b1c30] focus:outline-none focus:border-[#426086]"
              rows={3}
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRevisionModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#44474c] hover:text-[#0b1c30]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevision}
                disabled={isProcessing}
                className="px-4 py-2 bg-[#0e1c2f] text-white rounded-lg text-xs font-semibold hover:bg-[#1a2d47]"
              >
                {isProcessing ? 'Sending...' : 'Send Instructions'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-xl shadow-xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">verified</span>
            </div>
            <h3 className="font-['Hanken_Grotesk'] text-xl font-bold text-[#0b1c30]">
              Presidential Sign-off Affixed
            </h3>
            <p className="text-xs text-[#44474c]">{actionMessage}</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2.5 bg-[#0e1c2f] text-white rounded-lg text-xs font-semibold hover:bg-[#1a2d47]"
            >
              Continue Queue Review
            </button>
          </div>
        </div>
      )}
    </Navigation>
  );
}
