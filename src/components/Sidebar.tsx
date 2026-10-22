'use client';

import React from 'react';
import {
  Wallet,
  Clock,
  CheckCircle2,
  Users,
  BarChart3,
  Utensils,
  Plane,
  Home,
  Zap,
  Bot,
  ChevronDown,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  overdueCount: number;
  friendsCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenAssistant?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeCategory,
  setActiveCategory,
  overdueCount,
  friendsCount,
  isMobileOpen = false,
  onCloseMobile,
  onOpenAssistant,
}) => {
  const triggerHaptic = (ms = 2) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([ms]); } catch (_) {}
    }
  };

  const navItems = [
    { id: 'all', label: 'All Loans', icon: Wallet, count: null },
    { id: 'overdue', label: 'Overdue', icon: Clock, count: overdueCount, isOverdue: true },
    { id: 'settled', label: 'Settled', icon: CheckCircle2, count: null },
    { id: 'friends', label: 'Friends', icon: Users, count: friendsCount },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, count: null },
  ];

  const spaces = [
    { id: 'dining', label: 'Dinner & Drinks', icon: Utensils },
    { id: 'trips', label: 'Weekend Trips', icon: Plane },
    { id: 'bills', label: 'Rent & Shared Bills', icon: Home },
    { id: 'cash', label: 'Emergency Cash', icon: Zap },
  ];

  const content = (
    <div className="h-full flex flex-col justify-between p-4 select-none">
      <div className="space-y-6">
        {/* Brand Squircle Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm tracking-wider shadow-xs shadow-emerald-600/30">
              M•L
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                MiniLedger
              </span>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Active Ledger Dropdown Pill */}
        <button
          onClick={() => triggerHaptic(2)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-100/80 dark:bg-[#121824] border border-slate-200/60 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Personal Ledger (Main)</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Section 1: MY FINANCES */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase px-3 py-1">
            MY FINANCES
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeCategory === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  triggerHaptic(2);
                  setActiveCategory(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== null && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      item.isOverdue
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Section 2: SPACES */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase px-3 py-1">
            SPACES
          </p>
          {spaces.map((sp) => {
            const Icon = sp.icon;
            const isActive = activeCategory === sp.id;
            return (
              <button
                key={sp.id}
                onClick={() => {
                  triggerHaptic(2);
                  setActiveCategory(sp.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-slate-400" />
                <span>{sp.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Assistant Card & Profile Row */}
      <div className="space-y-3 mt-6">
        <button
          onClick={() => {
            triggerHaptic(10);
            if (onOpenAssistant) onOpenAssistant();
          }}
          className="w-full p-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/30 dark:via-transparent border border-emerald-500/20 text-left hover:border-emerald-500/40 transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                Questions on a debt?
              </p>
              <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                Ask Ledger Assistant →
              </p>
            </div>
          </div>
        </button>

        {/* User Profile Bar */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/70 dark:bg-[#121824] border border-slate-200/60 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
              YJ
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                Yash Jain
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                +91 98765 43210
              </p>
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500" title="Online & Synced" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Rail */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200/60 dark:border-white/10 bg-white dark:bg-[#0d131f] sticky top-0 h-screen overflow-y-auto">
        {content}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-72 h-full bg-white dark:bg-[#0d131f] border-r border-slate-200/60 dark:border-white/10 shadow-xl"
          >
            {content}
          </div>
        </div>
      )}
    </>
  );
};
