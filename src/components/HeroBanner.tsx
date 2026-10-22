'use client';

import React from 'react';
import { Sparkles, Calendar, TrendingUp, ShieldCheck, HeartHandshake } from 'lucide-react';
import { tactile } from '@/lib/tactileFeedback';

interface HeroBannerProps {
  overdueCount: number;
  upcomingCount: number;
  upcomingAmount: number;
  userName?: string;
  onRecordClick?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  overdueCount,
  upcomingCount,
  upcomingAmount,
  userName = '',
  onRecordClick,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-amber-50/30 to-indigo-50/40 dark:from-[#0d1424] dark:via-[#11192e] dark:to-[#0b101c] border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-xs tactile-card">
      {/* Ambient background blur orbs */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-gradient-to-br from-amber-300/20 via-pink-400/15 to-indigo-400/20 blur-3xl dark:from-amber-500/10 dark:via-purple-500/10 dark:to-indigo-500/10" />
      <div className="pointer-events-none absolute left-1/3 -bottom-16 h-48 w-48 rounded-full bg-emerald-400/15 blur-2xl dark:bg-emerald-500/10" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left Column: Greeting & Status */}
        <div className="space-y-3 max-w-2xl">
          {/* Greeting Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-bold tracking-wide shadow-2xs">
            <span>👋 {userName ? `GOOD DAY, ${userName.toUpperCase()}` : 'WELCOME BACK'}</span>
            <span className="text-amber-500">☀️</span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Today&apos;s Cash Flow &amp; Lent Money
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {upcomingCount > 0 ? (
              <>
                <strong className="font-semibold text-slate-800 dark:text-white">
                  {upcomingCount} {upcomingCount === 1 ? 'friend has' : 'friends have'}
                </strong>{' '}
                upcoming repayments this week totaling{' '}
                <strong className="font-semibold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  ₹{upcomingAmount.toLocaleString('en-IN')}
                </strong>
                . Friendly reminders are ready.
              </>
            ) : (
              'All current balances are up to date. Keep your friendly ledger organized with polite reminders.'
            )}
          </p>

          {/* Fast metric pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            {overdueCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 font-semibold">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                {overdueCount} {overdueCount === 1 ? 'Debt' : 'Debts'} Overdue
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 touch-icon" />
              Receipts Backed
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 touch-icon" />
              Zero Awkwardness
            </span>
          </div>
        </div>

        {/* Right Column: Floating Motivational Card */}
        <div className="relative shrink-0">
          <div
            onClick={() => tactile.subtle()}
            className="relative transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 w-full sm:w-72 p-5 rounded-2xl bg-white/95 dark:bg-[#131b2e]/95 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-lg shadow-slate-200/50 dark:shadow-none cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 touch-icon">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug italic font-serif">
                  &ldquo;Healthy friendships start with clear numbers.&rdquo;
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Track once, preserve peace of mind forever.
                </p>
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 dark:text-slate-500">Personal Ledger</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Engine
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
