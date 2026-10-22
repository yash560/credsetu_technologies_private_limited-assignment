'use client';

import React, { useState } from 'react';
import { Users, Send, Plus, CheckCircle2, AlertTriangle, Clock, ArrowRight, IndianRupee, Sparkles } from 'lucide-react';
import { LoanEntry } from '@/types';
import { tactile } from '@/lib/tactileFeedback';

interface FriendsDirectoryViewProps {
  loans: LoanEntry[];
  onSendReminder: (loan: LoanEntry) => void;
  onOpenAddModal: (prefillName?: string) => void;
  onToggleRepay: (id: string, current: boolean) => Promise<void>;
}

export const FriendsDirectoryView: React.FC<FriendsDirectoryViewProps> = ({
  loans,
  onSendReminder,
  onOpenAddModal,
  onToggleRepay,
}) => {
  const [filter, setFilter] = useState<'all' | 'owes' | 'settled'>('all');

  // Group loans by friend name
  const friendMap: { [name: string]: LoanEntry[] } = {};
  loans.forEach((l) => {
    if (!friendMap[l.friend_name]) friendMap[l.friend_name] = [];
    friendMap[l.friend_name].push(l);
  });

  const friendsList = Object.entries(friendMap).map(([name, friendLoans]) => {
    const totalLent = friendLoans.reduce((sum, l) => sum + l.amount, 0);
    const totalRepaid = friendLoans.filter((l) => l.is_repaid).reduce((sum, l) => sum + l.amount, 0);
    const outstanding = totalLent - totalRepaid;
    const hasOverdue = friendLoans.some((l) => l.is_overdue && !l.is_repaid);
    const loanCount = friendLoans.length;

    return {
      name,
      loans: friendLoans,
      totalLent,
      totalRepaid,
      outstanding,
      hasOverdue,
      loanCount,
      isFullySettled: outstanding === 0,
    };
  });

  const filteredFriends = friendsList.filter((f) => {
    if (filter === 'owes') return f.outstanding > 0;
    if (filter === 'settled') return f.isFullySettled;
    return true;
  });

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>FRIENDS &amp; DEBTS DIRECTORY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Peer Balances &amp; Borrowing History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Keep individual friend tabs clear. Track lifetime lent totals and one-click settle.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              tactile.subtle();
              setFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
            }`}
          >
            All ({friendsList.length})
          </button>
          <button
            type="button"
            onClick={() => {
              tactile.subtle();
              setFilter('owes');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'owes'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
            }`}
          >
            Pending ({friendsList.filter((f) => f.outstanding > 0).length})
          </button>
          <button
            type="button"
            onClick={() => {
              tactile.subtle();
              setFilter('settled');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'settled'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
            }`}
          >
            Settled ({friendsList.filter((f) => f.isFullySettled).length})
          </button>
        </div>
      </div>

      {/* Friends Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFriends.map((friend) => (
          <div
            key={friend.name}
            className="rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 shadow-xs hover:border-emerald-500/30 hover:shadow-md transition-all space-y-4"
          >
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 text-white font-extrabold text-base flex items-center justify-center shadow-xs">
                  {getInitials(friend.name)}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {friend.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {friend.loanCount} {friend.loanCount === 1 ? 'transaction' : 'transactions'} recorded
                  </p>
                </div>
              </div>

              {friend.hasOverdue && (
                <span className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold text-[11px] flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Overdue
                </span>
              )}
            </div>

            {/* Balances */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-[#121927] border border-slate-200/60 dark:border-white/5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Lent
                </span>
                <p className="font-black text-sm text-slate-900 dark:text-white mt-0.5">
                  ₹{friend.totalLent.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Current Balance
                </span>
                <p
                  className={`font-black text-sm mt-0.5 ${
                    friend.outstanding > 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {friend.outstanding > 0
                    ? `₹${friend.outstanding.toLocaleString('en-IN')} due`
                    : 'All Cleared ✓'}
                </p>
              </div>
            </div>

            {/* Individual loan entries for this friend */}
            <div className="space-y-1.5 divide-y divide-slate-100 dark:divide-white/5 max-h-36 overflow-y-auto">
              {friend.loans.map((l) => (
                <div key={l.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block max-w-[180px]">
                      {l.notes || 'Peer Debt'}
                    </span>
                    <span className="text-[10px] text-slate-400">Due {l.due_date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      ₹{l.amount.toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        tactile.tap();
                        onToggleRepay(l.id, l.is_repaid);
                      }}
                      className={`p-1 rounded-md text-[10px] ${
                        l.is_repaid
                          ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                          : 'text-slate-400 hover:text-emerald-600'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions for this friend */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
              {friend.outstanding > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    tactile.tap();
                    const activeLoan = friend.loans.find((l) => !l.is_repaid) || friend.loans[0];
                    onSendReminder(activeLoan);
                  }}
                  className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold text-xs shadow-xs transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reminder</span>
                </button>
              ) : (
                <span className="flex-1 text-center py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Fully Cleared
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  tactile.subtle();
                  onOpenAddModal(friend.name);
                }}
                className="h-9 px-3 inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Debt</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
