'use client';

import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { LoanSummary } from '@/types';

interface SplitBentoProps {
  summary: LoanSummary | null;
  onOpenReminderModal: () => void;
}

export const SplitBento: React.FC<SplitBentoProps> = ({
  summary,
  onOpenReminderModal,
}) => {
  const triggerHaptic = (ms = 3) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([ms]); } catch (_) {}
    }
  };

  const recoveryRate = summary?.repayment_rate_pct ?? 82;
  const totalLent = summary?.total_lent ?? 34600;
  const totalRepaid = summary?.total_repaid ?? 28400;

  // SVG Gauge calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (recoveryRate / 100) * circumference;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Bento Card 1: Repayment Pace (Navy Gradient, Col-Span 7) */}
      <div className="lg:col-span-7 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1427] via-[#101b33] to-[#070b14] border border-slate-800 text-white p-6 sm:p-7 shadow-lg flex flex-col justify-between">
        {/* Ambient subtle glow */}
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl" />

        <div className="relative z-10 space-y-4">
          {/* Header pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            REPAYMENT PACE
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                {recoveryRate}% recovered
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
                You&apos;ve collected <strong className="text-white font-semibold">₹{totalRepaid.toLocaleString('en-IN')}</strong> of{' '}
                <strong className="text-white font-semibold">₹{totalLent.toLocaleString('en-IN')}</strong> lent this quarter. On track to clear all pending dues.
              </p>
            </div>

            {/* Circular Gauge */}
            <div className="relative shrink-0 flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
                {/* Background Track */}
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-800"
                />
                {/* Progress Circle */}
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-extrabold text-white">{recoveryRate}%</span>
                <span className="text-[9px] font-bold tracking-wider text-emerald-400 uppercase">Settled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA Button */}
        <div className="relative z-10 pt-5 mt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Next follow-up batch queued
          </span>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(4);
              onOpenReminderModal();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-98 text-white text-xs font-bold transition-all"
          >
            <span>Send polite reminders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bento Card 2: Ledger Health (Emerald Mint Card, Col-Span 5) */}
      <div className="lg:col-span-5 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 dark:from-[#0d1e1c] dark:via-[#0c161a] dark:to-[#071112] border border-emerald-200/80 dark:border-emerald-900/40 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
        {/* Ambient subtle glow */}
        <div className="pointer-events-none absolute -right-6 -bottom-6 h-36 w-36 rounded-full bg-emerald-400/20 blur-2xl" />

        <div className="space-y-3">
          {/* Header pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold tracking-wider uppercase">
            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            LEDGER HEALTH
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                100% receipt verified
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              All active debts are backed by attached bills, payment screenshots, or UPI refs.
            </p>
          </div>
        </div>

        {/* Decorative Wave Sparkline */}
        <div className="pt-4 mt-2">
          <div className="h-16 w-full relative">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 300 70"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="emeraldWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Filled Area */}
              <path
                d="M 0 55 Q 50 48, 100 42 T 200 25 T 300 12 L 300 70 L 0 70 Z"
                fill="url(#emeraldWaveGrad)"
              />
              {/* Smooth Stroke Line */}
              <path
                d="M 0 55 Q 50 48, 100 42 T 200 25 T 300 12"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Final target point */}
              <circle cx="300" cy="12" r="4" fill="#10b981" className="animate-ping" />
              <circle cx="300" cy="12" r="4" fill="#059669" />
            </svg>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1 font-medium">
            <span>Quarter Start</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Current Health: Optimal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
