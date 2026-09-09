'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ApprovalsPage() {
  const [showBatchDrawer, setShowBatchDrawer] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [revisionInstructions, setRevisionInstructions] = useState('');

  const handleApprove = () => {
    setShowSuccessModal(true);
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col justify-between selection:bg-[#b3d1fd] selection:text-[#3b5a7f]">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#0e1c2f] text-white z-50 flex flex-col shadow-lg">
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

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <nav className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold text-[#77849c] uppercase tracking-wider font-['Inter']">
              Overview
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/80 hover:bg-white/10 text-xs font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-sm">dashboard</span>
              <span>Dashboard</span>
            </Link>
          </nav>

          <nav className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold text-[#77849c] uppercase tracking-wider font-['Inter']">
              Governance & Control
            </div>
            <Link
              href="/approvals"
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#dce9ff] text-[#0b1c30] font-semibold text-xs transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span>Approvals</span>
              </div>
              <span className="bg-[#ffdad6] text-[#93000a] text-[10px] font-bold px-2 py-0.5 rounded-full">
                3 Pending
              </span>
            </Link>
          </nav>
        </div>

        <div className="p-3 bg-white/5 border-t border-white/10">
          <div className="bg-[#1c2d42] p-3 rounded-lg flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#77849c] uppercase">Viewing As</span>
              <span className="bg-[#b3d1fd] text-[#3b5a7f] text-[10px] font-bold px-2 py-0.5 rounded-full">Executive</span>
            </div>
            <div className="flex items-center justify-between text-white text-xs font-semibold">
              <span>Society President</span>
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
                placeholder="Search approval vouchers..."
                className="w-full h-9 pl-10 pr-4 bg-[#eff4ff] rounded-lg text-xs text-[#0b1c30] placeholder:text-[#44474c] focus:outline-none focus:ring-1 focus:ring-[#426086]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 pl-2">
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

        {/* MAIN APPROVAL QUEUE BODY */}
        <main className="w-full pt-20 px-6 py-6 flex-1 flex flex-col space-y-6">
          
          {/* Top Header Ribbon */}
          <section className="w-full bg-white p-6 rounded-xl shadow-sm border border-[#c5c6cd]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-[#0e1c2f]">shield</span>
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#426086] font-semibold uppercase tracking-wider">
                  President Review Gate
                </span>
              </div>
              <h1 className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] tracking-tight mt-1">
                Transaction Approval Queue
              </h1>
              <p className="text-xs text-[#44474c] mt-0.5">
                Review society financial requests requiring Presidential sign-off according to dual treasury control rules.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBatchDrawer(true)}
                className="h-9 px-4 bg-[#0e1c2f] text-white hover:bg-[#1a2d47] rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-base">rule</span>
                <span>Batch Sign (3 Items)</span>
              </button>
            </div>
          </section>

          {/* Quick Metrics Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-[#c5c6cd]/30">
              <span className="text-[10px] font-bold text-[#44474c] uppercase">Pending Decision</span>
              <div className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] mt-2">Rs. 62,500.00</div>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#ba1a1a] font-semibold">3 Vouchers Pending</span>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-[#c5c6cd]/30">
              <span className="text-[10px] font-bold text-[#44474c] uppercase">Decision Turnaround</span>
              <div className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] mt-2">14.2 Hours</div>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#10B981]">Average Processing Time</span>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-[#c5c6cd]/30">
              <span className="text-[10px] font-bold text-[#44474c] uppercase">Approved This Term</span>
              <div className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] mt-2">Rs. 845,000.00</div>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#426086]">38 Approved Vouchers</span>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-[#c5c6cd]/30">
              <span className="text-[10px] font-bold text-[#44474c] uppercase">Revisions Requested</span>
              <div className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#0b1c30] mt-2">4 Items</div>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#44474c]">Sent Back for Amendment</span>
            </div>
          </section>

          {/* Main Inspection Dossier & Queue Grid */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Detailed Voucher Inspection */}
            <div className="xl:col-span-8 bg-white rounded-xl shadow-sm border border-[#c5c6cd]/30 overflow-hidden flex flex-col">
              
              {/* Security Header */}
              <div className="bg-[#0e1c2f] text-white px-6 py-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest bg-[#426086] text-white px-2 py-0.5 rounded">
                    Voucher In-Review
                  </span>
                  <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#38BDF8]">#EXP-2024-104</span>
                  <span className="text-xs text-gray-300">Annual Tech Fest 2024</span>
                </div>
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#77849c]">Submitted Today, 04:30 PM</span>
              </div>

              {/* Header Title & Amount */}
              <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-[10px] font-bold text-[#426086] uppercase tracking-wider">Audio & Visual Hire</span>
                  <h2 className="font-['Hanken_Grotesk'] text-xl font-bold text-[#0b1c30] mt-1">
                    Sound Equipment & Mic Rental for Annual Tech Fest
                  </h2>
                  <div className="text-xs text-[#44474c] mt-1">
                    Vendor: <strong className="text-[#0b1c30]">Sonic Pro Audio (Pvt) Ltd</strong>
                  </div>
                </div>

                <div className="bg-[#eff4ff] p-4 rounded-xl flex flex-col items-end min-w-[180px]">
                  <span className="text-[10px] font-semibold text-[#44474c] uppercase">Total Claim Sum</span>
                  <div className="font-['JetBrains_Mono'] text-xl font-bold text-[#0b1c30]">Rs. 28,500.00</div>
                  <span className="font-['JetBrains_Mono'] text-[10px] text-[#426086]">LKR Currency</span>
                </div>
              </div>

              {/* Submitter Ribbon */}
              <div className="mx-6 p-4 bg-[#eff4ff] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0e1c2f] text-white font-bold flex items-center justify-center text-xs">
                    SB
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0b1c30]">Sandun Bandara (Student ID: EG/2021/045)</div>
                    <div className="text-[11px] text-[#44474c]">Assistant Treasurer • Rotaract & Tech Club</div>
                  </div>
                </div>
              </div>

              {/* Budget Pool Impact */}
              <div className="p-6 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0b1c30]">Event Budget Pool Impact: Audio/Visual</span>
                  <span className="font-['JetBrains_Mono'] text-[#0b1c30]">Rs. 28,500.00 / Rs. 40,000.00</span>
                </div>
                <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#426086] h-full rounded-full" style={{ width: '71.25%' }}></div>
                </div>
                <div className="text-[11px] text-[#10B981] font-medium">
                  ✓ Within approved budget allocation limits. Remaining balance: Rs. 11,500.00
                </div>
              </div>

              {/* Action Decision Bar */}
              <div className="bg-[#eff4ff] p-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#c5c6cd]/20">
                <div className="text-xs text-[#44474c] font-['JetBrains_Mono']">
                  Presidential Action Required
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="px-4 py-2 bg-white text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg text-xs font-semibold transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setShowRevisionModal(true)}
                    className="px-4 py-2 bg-white text-[#0b1c30] hover:bg-[#dce9ff] rounded-lg text-xs font-semibold transition-colors"
                  >
                    Request Revision
                  </button>
                  <button
                    onClick={handleApprove}
                    className="px-6 py-2 bg-[#0e1c2f] text-white hover:bg-[#1a2d47] rounded-lg text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">gavel</span>
                    <span>Approve & Issue Voucher</span>
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Other Pending Items in Queue */}
            <div className="xl:col-span-4 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#44474c] px-1">
                Other Pending Requests in Queue
              </div>

              {/* Card 2 */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-[#c5c6cd]/30 space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-['JetBrains_Mono'] font-bold text-[#0b1c30]">#EXP-2024-105</span>
                  <span className="text-[#426086] uppercase font-bold">Catering</span>
                </div>
                <div className="text-xs font-bold text-[#0b1c30]">Refreshments for Workshop Attendees</div>
                <div className="text-[11px] text-[#44474c]">Submitter: Dinithi Silva (Treasurer)</div>
                <div className="font-['JetBrains_Mono'] text-sm font-bold text-[#0b1c30]">Rs. 24,000.00</div>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-[#c5c6cd]/30 space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-['JetBrains_Mono'] font-bold text-[#0b1c30]">#INC-2024-041</span>
                  <span className="text-[#10B981] uppercase font-bold">Income Deposit</span>
                </div>
                <div className="text-xs font-bold text-[#0b1c30]">Sponsorship Milestone Deposit</div>
                <div className="text-[11px] text-[#44474c]">Submitter: Kavindu Ratnayake</div>
                <div className="font-['JetBrains_Mono'] text-sm font-bold text-[#10B981]">+ Rs. 100,000.00</div>
              </div>
            </div>

          </section>

        </main>

        {/* Footer */}
        <footer className="w-full bg-[#eff4ff] border-t border-[#c5c6cd]/30 py-3 px-6">
          <div className="flex items-center justify-between text-xs text-[#44474c]">
            <span>FinFlow — Society Transaction Approval Engine</span>
            <span className="font-['JetBrains_Mono'] text-[11px]">Dual Sign-off Active</span>
          </div>
        </footer>

      </div>

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-xl shadow-xl p-6 space-y-4">
            <h3 className="font-['Hanken_Grotesk'] text-lg font-bold text-[#ba1a1a]">Reject Transaction Request</h3>
            <p className="text-xs text-[#44474c]">
              Please state the reason for rejecting voucher #EXP-2024-104 (Rs. 28,500.00).
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="State reason for rejection..."
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
                onClick={() => {
                  setShowRejectModal(false);
                  alert('Transaction rejected.');
                }}
                className="px-4 py-2 bg-[#ba1a1a] text-white rounded-lg text-xs font-semibold hover:bg-[#93000a]"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVISION MODAL */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-xl shadow-xl p-6 space-y-4">
            <h3 className="font-['Hanken_Grotesk'] text-lg font-bold text-[#0b1c30]">Request Revision</h3>
            <p className="text-xs text-[#44474c]">
              Notify submitter Sandun Bandara to amend details for #EXP-2024-104.
            </p>
            <textarea
              value={revisionInstructions}
              onChange={(e) => setRevisionInstructions(e.target.value)}
              placeholder="Enter instructions for amendment..."
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
                onClick={() => {
                  setShowRevisionModal(false);
                  alert('Revision request sent to submitter.');
                }}
                className="px-4 py-2 bg-[#0e1c2f] text-white rounded-lg text-xs font-semibold hover:bg-[#1a2d47]"
              >
                Send Revision Request
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
            <h3 className="font-['Hanken_Grotesk'] text-xl font-bold text-[#0b1c30]">Presidential Sign-off Affixed</h3>
            <p className="text-xs text-[#44474c]">
              Voucher <strong>#EXP-2024-104</strong> for <strong>Rs. 28,500.00</strong> has been approved and moved to Treasurer disbursement queue.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2.5 bg-[#0e1c2f] text-white rounded-lg text-xs font-semibold hover:bg-[#1a2d47]"
            >
              Return to Approvals Queue
            </button>
          </div>
        </div>
      )}

      {/* BATCH DRAWER */}
      {showBatchDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-[#e5eeff]">
                <h3 className="font-['Hanken_Grotesk'] text-lg font-bold text-[#0b1c30]">Batch Executive Approval</h3>
                <button onClick={() => setShowBatchDrawer(false)} className="text-[#44474c] hover:text-[#0b1c30]">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
              <p className="text-xs text-[#44474c]">
                Executing batch sign-off will approve all 3 pending items simultaneously.
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-[#f8f9ff] rounded border border-[#c5c6cd]/30 flex justify-between">
                  <span>#EXP-2024-104 (Audio Rental)</span>
                  <span className="font-['JetBrains_Mono'] font-bold">Rs. 28,500.00</span>
                </div>
                <div className="p-3 bg-[#f8f9ff] rounded border border-[#c5c6cd]/30 flex justify-between">
                  <span>#EXP-2024-105 (Workshop Catering)</span>
                  <span className="font-['JetBrains_Mono'] font-bold">Rs. 24,000.00</span>
                </div>
                <div className="p-3 bg-[#f8f9ff] rounded border border-[#c5c6cd]/30 flex justify-between">
                  <span>#INC-2024-041 (IFS Sponsorship)</span>
                  <span className="font-['JetBrains_Mono'] font-bold text-[#10B981]">+ Rs. 100,000.00</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-[#e5eeff]">
              <button
                onClick={() => {
                  setShowBatchDrawer(false);
                  alert('Batch approval signed for 3 items!');
                }}
                className="w-full py-3 bg-[#0e1c2f] text-white rounded-lg text-xs font-semibold hover:bg-[#1a2d47]"
              >
                Sign & Approve All (3 Items)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
