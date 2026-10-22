'use client';

import React, { useState } from 'react';
import {
  IndianRupee,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Send,
  Receipt,
  Trash2,
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
} from 'lucide-react';
import { LoanEntry, LoanFilter } from '@/types';
import { tactile } from '@/lib/tactileFeedback';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';

interface PriorityActionLedgerProps {
  loans: LoanEntry[];
  onToggleRepay: (id: string, current: boolean) => Promise<void>;
  onDeleteLoan: (id: string) => Promise<void>;
  onViewReceipt: (url: string) => void;
  onSendReminder: (loan: LoanEntry) => void;
}

export const PriorityActionLedger: React.FC<PriorityActionLedgerProps> = ({
  loans,
  onToggleRepay,
  onDeleteLoan,
  onViewReceipt,
  onSendReminder,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'overdue' | 'due_soon' | 'settled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingDeleteLoan, setPendingDeleteLoan] = useState<LoanEntry | null>(null);

  // Filter logic
  const filteredLoans = loans.filter((loan) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = loan.friend_name.toLowerCase().includes(q);
      const matchesNotes = loan.notes?.toLowerCase().includes(q) ?? false;
      const matchesAmount = loan.amount.toString().includes(q);
      if (!matchesName && !matchesNotes && !matchesAmount) return false;
    }

    if (activeTab === 'all') return true;
    if (activeTab === 'overdue') return loan.is_overdue && !loan.is_repaid;
    if (activeTab === 'due_soon') return !loan.is_overdue && !loan.is_repaid;
    if (activeTab === 'settled') return loan.is_repaid;
    return true;
  });

  const overdueCount = loans.filter((l) => l.is_overdue && !l.is_repaid).length;
  const dueSoonCount = loans.filter((l) => !l.is_overdue && !l.is_repaid).length;
  const settledCount = loans.filter((l) => l.is_repaid).length;

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarBg = (name: string) => {
    const colors = [
      'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
      'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
      'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
      'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 p-5 sm:p-7 shadow-xs space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Priority Repayments &amp; Follow-ups
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold">
              {filteredLoans.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Send polite reminders with 1-tap pre-written friendly copy. Zero awkwardness.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => {
              tactile.subtle();
              setActiveTab('all');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap active:scale-95 ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            All ({loans.length})
          </button>
          <button
            type="button"
            onClick={() => {
              tactile.subtle();
              setActiveTab('overdue');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap active:scale-95 ${
              activeTab === 'overdue'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            Overdue ({overdueCount})
          </button>
          <button
            type="button"
            onClick={() => {
              tactile.subtle();
              setActiveTab('due_soon');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap active:scale-95 ${
              activeTab === 'due_soon'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            Due Soon ({dueSoonCount})
          </button>
          <button
            type="button"
            onClick={() => {
              tactile.subtle();
              setActiveTab('settled');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap active:scale-95 ${
              activeTab === 'settled'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            Settled ({settledCount})
          </button>
        </div>
      </div>

      {/* Quick Search inside ledger */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by friend name or note..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-[#121927] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Table / Card List */}
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {filteredLoans.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No entries found
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All debts in this category are settled or none match your query.
            </p>
          </div>
        ) : (
          filteredLoans.map((loan) => {
            const isSettled = loan.is_repaid;
            const isOverdue = loan.is_overdue && !isSettled;

            return (
              <div
                key={loan.id}
                className="py-4 first:pt-1 last:pb-1 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-white/2 rounded-2xl px-2.5 transition-all group"
              >
                {/* Friend Info & Notes */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs group-hover:scale-105 transition-transform ${getAvatarBg(
                      loan.friend_name
                    )}`}
                  >
                    {getInitials(loan.friend_name)}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {loan.friend_name}
                      </span>
                      {loan.receipt_url && (
                        <button
                          type="button"
                          onClick={() => {
                            tactile.tap();
                            onViewReceipt(loan.receipt_url!);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold hover:underline touch-icon"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {loan.notes || 'Personal loan'}
                    </p>
                  </div>
                </div>

                {/* Status & Deadline */}
                <div className="flex items-center gap-3">
                  {isSettled ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Settled
                    </span>
                  ) : isOverdue ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      Overdue by {loan.days_overdue || 1}d
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      Due: {loan.due_date}
                    </span>
                  )}
                </div>

                {/* Amount */}
                <div className="text-left md:text-right shrink-0">
                  <div className="text-base sm:text-lg font-black font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
                    ₹{loan.amount.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    {isSettled ? 'Cleared' : 'Pending repayment'}
                  </span>
                </div>

                {/* Actions: Send Reminder + Toggle Settled + Custom Delete Modal */}
                <div className="flex items-center gap-2 pt-2 md:pt-0">
                  {!isSettled && (
                    <button
                      type="button"
                      onClick={() => {
                        tactile.tap();
                        onSendReminder(loan);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold shadow-xs shadow-indigo-600/20 transition-all tactile-btn"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>▷ Send Reminder</span>
                    </button>
                  )}

                  {/* Toggle Settled button */}
                  <button
                    type="button"
                    onClick={() => {
                      tactile.tap();
                      onToggleRepay(loan.id, loan.is_repaid);
                    }}
                    title={isSettled ? 'Mark as Pending' : 'Mark as Settled'}
                    className={`p-2 rounded-xl border text-xs font-semibold transition-all active:scale-90 ${
                      isSettled
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 touch-icon" />
                  </button>

                  {/* Delete button triggering Custom Modal (NEVER native confirm) */}
                  <button
                    type="button"
                    onClick={() => {
                      tactile.subtle();
                      setPendingDeleteLoan(loan);
                    }}
                    title="Delete Entry"
                    className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors active:scale-90"
                  >
                    <Trash2 className="w-4 h-4 touch-icon" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(pendingDeleteLoan)}
        onClose={() => setPendingDeleteLoan(null)}
        friendName={pendingDeleteLoan?.friend_name || ''}
        amount={pendingDeleteLoan?.amount || 0}
        onConfirm={() => {
          if (pendingDeleteLoan) {
            onDeleteLoan(pendingDeleteLoan.id);
            setPendingDeleteLoan(null);
          }
        }}
      />
    </div>
  );
};
