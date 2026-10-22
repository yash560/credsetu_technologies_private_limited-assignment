'use client';

import React from 'react';

export const SkeletonCockpit: React.FC = () => {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        {/* Zone 2: Center Stage Skeleton */}
        <div className="flex-1 min-w-0 space-y-7 w-full">
          {/* 1. Hero Banner Skeleton */}
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-xs">
            <div className="skeleton-shimmer-sweep" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3.5 max-w-xl">
                {/* Greeting Badge */}
                <div className="h-6 w-44 rounded-full bg-slate-200 dark:bg-white/10" />
                {/* Headline */}
                <div className="h-9 w-3/4 rounded-xl bg-slate-200 dark:bg-white/10" />
                {/* Subtitle */}
                <div className="space-y-1.5">
                  <div className="h-4 w-full rounded-md bg-slate-100 dark:bg-white/5" />
                  <div className="h-4 w-2/3 rounded-md bg-slate-100 dark:bg-white/5" />
                </div>
                {/* Metric pills */}
                <div className="flex gap-2 pt-1">
                  <div className="h-7 w-28 rounded-lg bg-slate-100 dark:bg-white/5" />
                  <div className="h-7 w-32 rounded-lg bg-slate-100 dark:bg-white/5" />
                  <div className="h-7 w-32 rounded-lg bg-slate-100 dark:bg-white/5" />
                </div>
              </div>

              {/* Ambient quote card clone */}
              <div className="w-full sm:w-72 p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/10" />
                  <div className="space-y-1 flex-1">
                    <div className="h-3.5 w-full rounded bg-slate-200 dark:bg-white/10" />
                    <div className="h-3 w-3/4 rounded bg-slate-100 dark:bg-white/5" />
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex justify-between">
                  <div className="h-3 w-16 bg-slate-200 dark:bg-white/10 rounded" />
                  <div className="h-3 w-20 bg-slate-200 dark:bg-white/10 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Quick Ledger Hub Skeleton */}
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="skeleton-shimmer-sweep" />
            <div className="flex items-center justify-between">
              <div className="h-5 w-48 rounded bg-slate-200 dark:bg-white/10" />
              <div className="flex gap-1.5">
                <div className="h-6 w-14 rounded-full bg-slate-100 dark:bg-white/5" />
                <div className="h-6 w-14 rounded-full bg-slate-100 dark:bg-white/5" />
                <div className="h-6 w-14 rounded-full bg-slate-100 dark:bg-white/5" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="h-11 rounded-xl bg-slate-100 dark:bg-white/5" />
              <div className="h-11 rounded-xl bg-slate-100 dark:bg-white/5" />
              <div className="h-11 rounded-xl bg-slate-100 dark:bg-white/5" />
              <div className="h-11 rounded-xl bg-slate-100 dark:bg-white/5" />
            </div>
            <div className="flex justify-between items-center pt-1">
              <div className="h-4 w-40 rounded bg-slate-100 dark:bg-white/5" />
              <div className="h-11 w-36 rounded-xl bg-slate-200 dark:bg-white/10" />
            </div>
          </div>

          {/* 3. Split Bento Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Bento 1: Repayment Pace */}
            <div className="lg:col-span-7 relative overflow-hidden rounded-3xl bg-[#0c1427] border border-slate-800 p-6 sm:p-7 space-y-4">
              <div className="skeleton-shimmer-sweep" />
              <div className="h-6 w-36 rounded-full bg-slate-800" />
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="h-10 w-44 rounded-xl bg-slate-800" />
                  <div className="h-4 w-full rounded bg-slate-800/60" />
                  <div className="h-4 w-3/4 rounded bg-slate-800/60" />
                </div>
                <div className="w-24 h-24 rounded-full border-8 border-slate-800 shrink-0" />
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between">
                <div className="h-4 w-36 bg-slate-800 rounded" />
                <div className="h-8 w-36 bg-slate-800 rounded-xl" />
              </div>
            </div>

            {/* Bento 2: Ledger Health */}
            <div className="lg:col-span-5 relative overflow-hidden rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 p-6 sm:p-7 space-y-4">
              <div className="skeleton-shimmer-sweep" />
              <div className="h-6 w-32 rounded-full bg-slate-200 dark:bg-white/10" />
              <div className="h-8 w-48 rounded bg-slate-200 dark:bg-white/10" />
              <div className="h-4 w-full rounded bg-slate-100 dark:bg-white/5" />
              <div className="h-16 w-full rounded-xl bg-slate-100 dark:bg-white/5" />
            </div>
          </div>

          {/* 4. Priority Action Ledger Skeleton */}
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 p-5 sm:p-7 shadow-xs space-y-5">
            <div className="skeleton-shimmer-sweep" />
            <div className="flex items-center justify-between">
              <div className="h-6 w-52 rounded bg-slate-200 dark:bg-white/10" />
              <div className="flex gap-2">
                <div className="h-8 w-16 rounded-xl bg-slate-100 dark:bg-white/5" />
                <div className="h-8 w-20 rounded-xl bg-slate-100 dark:bg-white/5" />
                <div className="h-8 w-20 rounded-xl bg-slate-100 dark:bg-white/5" />
              </div>
            </div>
            <div className="space-y-3 divide-y divide-slate-100 dark:divide-white/5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="pt-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-200 dark:bg-white/10 shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded" />
                      <div className="h-3 w-48 bg-slate-100 dark:bg-white/5 rounded" />
                    </div>
                  </div>
                  <div className="h-7 w-28 bg-slate-100 dark:bg-white/5 rounded-full hidden sm:block" />
                  <div className="h-6 w-20 bg-slate-200 dark:bg-white/10 rounded text-right" />
                  <div className="h-9 w-28 bg-slate-200 dark:bg-white/10 rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zone 3: Right Inspector Skeleton */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 p-5 shadow-xs space-y-3">
            <div className="skeleton-shimmer-sweep" />
            <div className="h-4 w-28 bg-slate-200 dark:bg-white/10 rounded" />
            <div className="h-11 rounded-xl bg-slate-200 dark:bg-white/10" />
            <div className="h-10 rounded-xl bg-slate-100 dark:bg-white/5" />
            <div className="h-10 rounded-xl bg-slate-100 dark:bg-white/5" />
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 p-5 shadow-xs space-y-4">
            <div className="skeleton-shimmer-sweep" />
            <div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <div className="h-3.5 w-24 bg-slate-200 dark:bg-white/10 rounded" />
                    <div className="h-3.5 w-16 bg-slate-200 dark:bg-white/10 rounded" />
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-white/5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
