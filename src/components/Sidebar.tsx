'use client';

import React from 'react';
import {
  Wallet,
  Clock,
  CheckCircle2,
  Users,
  BarChart3,
  Calendar,
  Receipt,
  Utensils,
  Plane,
  Home,
  Zap,
  Bot,
  ChevronDown,
  X,
  LogOut,
  UserCheck,
  Plus,
} from 'lucide-react';
import { tactile } from '@/lib/tactileFeedback';

import { UserAccount } from '@/types';

interface SidebarProps {
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  overdueCount: number;
  friendsCount: number;
  receiptsCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenAssistant?: () => void;
  onOpenAuth?: () => void;
  activePhone: string;
  currentUser?: UserAccount | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeCategory,
  setActiveCategory,
  overdueCount,
  friendsCount,
  receiptsCount,
  isMobileOpen = false,
  onCloseMobile,
  onOpenAssistant,
  onOpenAuth,
  activePhone,
  currentUser,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Wallet, count: null },
    { id: 'friends', label: 'Friends & Debts', icon: Users, count: friendsCount },
    { id: 'schedule', label: 'Repayment Schedule', icon: Calendar, count: overdueCount > 0 ? overdueCount : null, isOverdue: overdueCount > 0 },
    { id: 'receipts', label: 'Receipts & Proofs', icon: Receipt, count: receiptsCount },
    { id: 'analytics', label: 'Monthly Analytics', icon: BarChart3, count: null },
  ];

  const spaces = [
    { id: 'dining', label: 'Dinner & Drinks', icon: Utensils, dotColor: 'bg-amber-400' },
    { id: 'trips', label: 'Weekend Trips', icon: Plane, dotColor: 'bg-emerald-400' },
    { id: 'bills', label: 'Rent & Shared Bills', icon: Home, dotColor: 'bg-indigo-400' },
    { id: 'cash', label: 'Emergency Cash', icon: Zap, dotColor: 'bg-purple-400' },
  ];

  const content = (
    <div className="h-full flex flex-col justify-between p-4 select-none">
      <div className="space-y-6">
        {/* Brand Squircle Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              tactile.tap();
              setActiveCategory('dashboard');
              if (onCloseMobile) onCloseMobile();
            }}
            className="flex items-center gap-3 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm tracking-wider shadow-xs shadow-emerald-600/30 group-hover:scale-105 group-hover:bg-emerald-500 transition-all">
              M•L
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white block">
                MiniLedger
              </span>
              <span className="text-[10px] text-slate-400 font-medium block">
                Personal Debt Tracker
              </span>
            </div>
          </button>
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
          onClick={() => tactile.subtle()}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-100/80 dark:bg-[#121824] border border-slate-200/60 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all hover:scale-[1.01] active:scale-[0.98]"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
                  tactile.tap();
                  setActiveCategory(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="touch-icon">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white'
                      }`}
                    />
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.count !== null && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-transform group-hover:scale-105 ${
                      item.isOverdue
                        ? 'bg-rose-500 text-white animate-pulse'
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
          <div className="flex items-center justify-between px-3 py-1">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
              SPACES
            </p>
          </div>
          {spaces.map((sp) => {
            const Icon = sp.icon;
            const isActive = activeCategory === sp.id;
            return (
              <button
                key={sp.id}
                onClick={() => {
                  tactile.tap();
                  setActiveCategory(sp.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${sp.dotColor}`} />
                  <span>{sp.label}</span>
                </div>
                <Icon className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Assistant Card & Profile Row */}
      <div className="space-y-3 mt-6">
        <button
          onClick={() => {
            tactile.tap();
            if (onOpenAssistant) onOpenAssistant();
          }}
          className="w-full p-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/30 dark:via-transparent border border-emerald-500/20 text-left hover:border-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center touch-icon">
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

        {/* User Profile Bar with Real Identity & Account Settings trigger */}
        <div
          onClick={() => {
            tactile.tap();
            if (onOpenAuth) onOpenAuth();
          }}
          className="cursor-pointer flex items-center justify-between p-2.5 rounded-xl bg-slate-100/70 dark:bg-[#121824] border border-slate-200/60 dark:border-white/5 hover:border-emerald-500/40 transition-all group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              {currentUser?.name ? currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'ML'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-500 transition-colors">
                {currentUser?.name || 'Ledger Account'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {currentUser?.email || activePhone}
              </p>
            </div>
          </div>
          <button
            type="button"
            title="Account & Security Settings"
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-white/5 transition-colors touch-icon"
          >
            <UserCheck className="w-4 h-4" />
          </button>
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
          className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-72 h-full bg-white dark:bg-[#0d131f] border-r border-slate-200/60 dark:border-white/10 shadow-xl animate-in slide-in-from-left duration-200"
          >
            {content}
          </div>
        </div>
      )}
    </>
  );
};
