'use client';

import React from 'react';
import { Utensils, Plane, Home, Zap, Plus, CheckCircle2, AlertTriangle, Send, IndianRupee } from 'lucide-react';
import { LoanEntry } from '@/types';
import { tactile } from '@/lib/tactileFeedback';

interface SpaceDetailViewProps {
  spaceId: string;
  loans: LoanEntry[];
  onOpenAddModal: (prefillNotes?: string) => void;
  onSendReminder: (loan: LoanEntry) => void;
  onToggleRepay: (id: string, current: boolean) => Promise<void>;
  onViewReceipt: (url: string) => void;
}

export const SpaceDetailView: React.FC<SpaceDetailViewProps> = ({
  spaceId,
  loans,
  onOpenAddModal,
  onSendReminder,
  onToggleRepay,
  onViewReceipt,
}) => {
  const getSpaceMeta = (id: string) => {
    switch (id) {
      case 'dining':
        return {
          title: 'Dinner & Drinks',
          desc: 'Shared restaurant bills, cafe catchups, and weekend dinners.',
          icon: Utensils,
          color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60',
          keywords: ['dinner', 'dining', 'drinks', 'burma', 'zomato', 'food', 'lunch'],
        };
      case 'trips':
        return {
          title: 'Weekend Trips & Getaways',
          desc: 'Shared flights, hotel reservations, rental cars, and tour passes.',
          icon: Plane,
          color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60',
          keywords: ['trip', 'flight', 'goa', 'ticket', 'hotel', 'travel'],
        };
      case 'bills':
        return {
          title: 'Rent & Shared Bills',
          desc: 'Monthly apartment rent, electricity, Wi-Fi, and shared groceries.',
          icon: Home,
          color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60',
          keywords: ['rent', 'bill', 'electricity', 'wifi', 'grocery', 'blinkit'],
        };
      case 'cash':
      default:
        return {
          title: 'Emergency Cash Loans',
          desc: 'Immediate peer-to-peer transfers, UPI cash lending, and urgent advances.',
          icon: Zap,
          color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/60',
          keywords: ['cash', 'emergency', 'urgent', 'advance', 'loan'],
        };
    }
  };

  const meta = getSpaceMeta(spaceId);
  const Icon = meta.icon;

  // Filter loans for this space based on keywords
  const spaceLoans = loans.filter((l) => {
    const note = (l.notes || '').toLowerCase();
    return meta.keywords.some((kw) => note.includes(kw));
  });

  const totalSpent = spaceLoans.reduce((acc, curr) => acc + curr.amount, 0);
  const totalSettled = spaceLoans.filter((l) => l.is_repaid).reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = totalSpent - totalSettled;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${meta.color}`}>
            <Icon className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {meta.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {meta.desc}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            tactile.tap();
            onOpenAddModal(`${meta.title} Split`);
          }}
          className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs shadow-xs transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Debt to Space</span>
        </button>
      </div>

      {/* Balance Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Space Total</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            ₹{totalSpent.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Settled Back</span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{totalSettled.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Outstanding Balance</span>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
            ₹{totalPending.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Loans in this space */}
      <div className="rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
          Transactions in this Space ({spaceLoans.length})
        </h3>

        {spaceLoans.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No entries logged under this category yet. Click &quot;+ Add Debt to Space&quot; above to begin.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {spaceLoans.map((loan) => (
              <div
                key={loan.id}
                className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {loan.friend_name}
                    </span>
                    {loan.receipt_url && (
                      <button
                        type="button"
                        onClick={() => onViewReceipt(loan.receipt_url!)}
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                      >
                        [Bill attached]
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{loan.notes}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                    ₹{loan.amount.toLocaleString('en-IN')}
                  </span>
                  {!loan.is_repaid && (
                    <button
                      type="button"
                      onClick={() => {
                        tactile.tap();
                        onSendReminder(loan);
                      }}
                      className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs"
                      title="Send WhatsApp Reminder"
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
                    className={`p-1.5 rounded-lg border text-xs ${
                      loan.is_repaid
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-emerald-600'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
