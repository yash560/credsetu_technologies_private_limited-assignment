'use client';

import React from 'react';
import { Receipt, ExternalLink, Plus, CheckCircle2, ShieldCheck } from 'lucide-react';
import { LoanEntry } from '@/types';
import { tactile } from '@/lib/tactileFeedback';

interface ReceiptsGalleryViewProps {
  loans: LoanEntry[];
  onViewReceipt: (url: string) => void;
  onOpenAddModal: () => void;
}

export const ReceiptsGalleryView: React.FC<ReceiptsGalleryViewProps> = ({
  loans,
  onViewReceipt,
  onOpenAddModal,
}) => {
  const receiptLoans = loans.filter((l) => Boolean(l.receipt_url));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <Receipt className="w-3.5 h-3.5" />
            <span>RECEIPTS &amp; PROOFS GALLERY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Bill Photos, Payment Proofs &amp; UPI Records
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Backed by Cloudinary CDN. Zero disputed numbers among friends.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            tactile.tap();
            onOpenAddModal();
          }}
          className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs shadow-xs transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Receipt</span>
        </button>
      </div>

      {/* Gallery Grid */}
      {receiptLoans.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 space-y-3">
          <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            No receipts uploaded yet
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            When you record a loan, attach a photo of the restaurant bill, airline confirmation, or UPI screenshot.
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-500 transition-colors"
          >
            + Record Loan with Bill
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {receiptLoans.map((loan) => (
            <div
              key={loan.id}
              onClick={() => {
                tactile.tap();
                onViewReceipt(loan.receipt_url!);
              }}
              className="group cursor-pointer rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-xs hover:border-emerald-500/40 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              {/* Image Preview Container */}
              <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                <img
                  src={loan.receipt_url!}
                  alt={loan.notes || 'Receipt proof'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>CDN Verified</span>
                </div>
                <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Card Meta */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {loan.friend_name}
                  </span>
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                    ₹{loan.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {loan.notes || 'Expense Receipt'}
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Due {loan.due_date}</span>
                  <span className={loan.is_repaid ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
                    {loan.is_repaid ? '✓ Settled' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
