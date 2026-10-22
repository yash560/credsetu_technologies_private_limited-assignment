'use client';

import React from 'react';
import {
  Plus,
  Send,
  Download,
  Bot,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Receipt,
  UserCheck,
  TrendingUp,
} from 'lucide-react';
import { LoanEntry, LoanSummary } from '@/types';

interface RightInspectorProps {
  loans: LoanEntry[];
  summary: LoanSummary | null;
  onOpenAddModal: () => void;
  onOpenReminderModal: () => void;
  onExportCsv: () => void;
  onOpenAssistant?: () => void;
}

export const RightInspector: React.FC<RightInspectorProps> = ({
  loans,
  summary,
  onOpenAddModal,
  onOpenReminderModal,
  onExportCsv,
  onOpenAssistant,
}) => {
  const triggerHaptic = (ms = 3) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([ms]); } catch (_) {}
    }
  };

  // Calculate top outstanding borrowers
  const borrowerTotals: { [name: string]: number } = {};
  loans
    .filter((l) => !l.is_repaid)
    .forEach((l) => {
      borrowerTotals[l.friend_name] = (borrowerTotals[l.friend_name] || 0) + l.amount;
    });

  const sortedBorrowers = Object.entries(borrowerTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const maxOutstanding = sortedBorrowers.length > 0 ? sortedBorrowers[0][1] : 1;

  // Recent simulated / live activity feed
  const activityFeed = [
    {
      id: '1',
      title: 'Kavita Patel settled via UPI',
      subtitle: '₹2,000 credited to HDFC bank',
      time: '2h ago',
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      id: '2',
      title: 'Polite reminder sent to Rohan',
      subtitle: 'WhatsApp link · Goa Air Tickets',
      time: '5h ago',
      icon: Send,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60',
    },
    {
      id: '3',
      title: 'New debt recorded: Ankit Gupta',
      subtitle: '₹1,500 · Concert tickets',
      time: 'Yesterday',
      icon: Plus,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60',
    },
    {
      id: '4',
      title: 'Receipt verified: Burma Burma',
      subtitle: 'Cloudinary CDN verified',
      time: '2d ago',
      icon: Receipt,
      color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/60',
    },
  ];

  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-6">
      {/* 1. Quick Actions Stack */}
      <div className="rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 p-5 shadow-xs space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Quick Actions
        </h3>

        {/* Primary Action */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic(4);
            onOpenAddModal();
          }}
          className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Record Lent Money</span>
        </button>

        {/* Polite Ping Action */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic(3);
            onOpenReminderModal();
          }}
          className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all border border-indigo-200/60 dark:border-indigo-800/40"
        >
          <Send className="w-3.5 h-3.5" />
          <span>💬 WhatsApp Polite Ping</span>
        </button>

        {/* Export CSV / PDF */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic(2);
            onExportCsv();
          }}
          className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all border border-slate-200/60 dark:border-white/5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>📊 Export Ledger CSV</span>
        </button>
      </div>

      {/* 2. Top Outstanding Leaderboard */}
      <div className="rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Top Outstanding
          </h3>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Active Dues
          </span>
        </div>

        {sortedBorrowers.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">No outstanding debts.</p>
        ) : (
          <div className="space-y-3.5">
            {sortedBorrowers.map(([name, sum]) => {
              const pct = Math.min(100, Math.round((sum / maxOutstanding) * 100));
              return (
                <div key={name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{name}</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      ₹{sum.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {/* Progress meter */}
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Live Stream Activity */}
      <div className="rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Recent Activity
          </h3>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>
        </div>

        <div className="space-y-3">
          {activityFeed.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate">{item.subtitle}</span>
                    <span className="shrink-0 ml-1">{item.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. AI Debt Assistant Capsule */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white p-5 border border-indigo-800 shadow-md">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl" />

        <div className="relative z-10 space-y-3">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-indigo-300">
            <Bot className="w-4 h-4" />
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white tracking-tight">
              Need help settling a debt?
            </h4>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Generate custom UPI settlement links or polite, stress-free WhatsApp drafts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(4);
              if (onOpenAssistant) {
                onOpenAssistant();
              } else {
                onOpenReminderModal();
              }
            }}
            className="w-full inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 active:scale-98 text-xs font-bold transition-all shadow-xs"
          >
            <span>Draft Friendly Message</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
