'use client';

import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle2, Send, ChevronRight, IndianRupee } from 'lucide-react';
import { LoanEntry } from '@/types';
import { tactile } from '@/lib/tactileFeedback';

interface RepaymentScheduleViewProps {
  loans: LoanEntry[];
  onSendReminder: (loan: LoanEntry) => void;
  onToggleRepay: (id: string, current: boolean) => Promise<void>;
}

export const RepaymentScheduleView: React.FC<RepaymentScheduleViewProps> = ({
  loans,
  onSendReminder,
  onToggleRepay,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Categorize debts into timeline buckets
  const overdue: LoanEntry[] = [];
  const thisWeek: LoanEntry[] = [];
  const nextWeek: LoanEntry[] = [];
  const future: LoanEntry[] = [];
  const completed: LoanEntry[] = [];

  loans.forEach((l) => {
    if (l.is_repaid) {
      completed.push(l);
      return;
    }
    const dueDate = new Date(l.due_date);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0 || l.is_overdue) {
      overdue.push(l);
    } else if (diffDays <= 7) {
      thisWeek.push(l);
    } else if (diffDays <= 14) {
      nextWeek.push(l);
    } else {
      future.push(l);
    }
  });

  const renderSection = (
    title: string,
    badgeColor: string,
    items: LoanEntry[],
    emptyText: string
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${badgeColor}`} />
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            {title} ({items.length})
          </h3>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-4 rounded-2xl bg-white/50 dark:bg-[#0c121e]/50 border border-slate-200/50 dark:border-white/5 text-xs text-slate-400">
          {emptyText}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((loan) => (
            <div
              key={loan.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 shadow-xs hover:border-emerald-500/30 transition-all flex items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {loan.friend_name}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Due: {loan.due_date}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {loan.notes || 'Personal loan'}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                    ₹{loan.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                {!loan.is_repaid && (
                  <button
                    type="button"
                    onClick={() => {
                      tactile.tap();
                      onSendReminder(loan);
                    }}
                    className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                    title="Send reminder"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    tactile.tap();
                    onToggleRepay(loan.id, loan.is_repaid);
                  }}
                  className={`p-2 rounded-xl border transition-colors ${
                    loan.is_repaid
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-emerald-600'
                  }`}
                  title={loan.is_repaid ? 'Marked settled' : 'Mark settled'}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 p-6 sm:p-7 shadow-xs space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold">
          <Calendar className="w-3.5 h-3.5" />
          <span>SCHEDULE &amp; REPAYMENT CALENDAR</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Upcoming Deadlines &amp; Repayment Velocity
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Automated timetable for all money lent out. Organized by urgency to ensure no debt slips through.
        </p>
      </div>

      {/* Timeline Buckets */}
      <div className="space-y-6">
        {renderSection('Past Due / Overdue', 'bg-rose-500 animate-pulse', overdue, 'No overdue debts! Everyone is on schedule.')}
        {renderSection('Due This Week', 'bg-amber-500', thisWeek, 'No repayments due in the next 7 days.')}
        {renderSection('Due Next Week', 'bg-indigo-500', nextWeek, 'No repayments scheduled for next week.')}
        {renderSection('Later & Beyond', 'bg-slate-400', future, 'No future debts scheduled.')}
        {renderSection('Recently Settled', 'bg-emerald-500', completed, 'No settled debts in this view.')}
      </div>
    </div>
  );
};
