'use client';

import React from 'react';
import { Sun, Moon, Terminal, RotateCcw, Smartphone, LayoutDashboard, Code2 } from 'lucide-react';

interface Props {
  isDark: boolean;
  toggleDark: () => void;
  viewMode: 'mobile' | 'desktop';
  setViewMode: (mode: 'mobile' | 'desktop') => void;
  isLogOpen: boolean;
  toggleLog: () => void;
  onResetData: () => void;
  onOpenArch: () => void;
  activePhone: string;
}

export const Navbar: React.FC<Props> = ({
  isDark,
  toggleDark,
  viewMode,
  setViewMode,
  isLogOpen,
  toggleLog,
  onResetData,
  onOpenArch,
  activePhone,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <span className="text-xl font-black">₹</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                MiniLedger
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Credsetu Assignment
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Peer Debt & Loan Tracker • Node.js + TS + PostgreSQL + React Native
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="hidden md:flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'mobile'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            React Native Simulator
          </button>
          <button
            onClick={() => setViewMode('desktop')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'desktop'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Back-Office Dashboard
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Architecture DDL Modal */}
          <button
            onClick={onOpenArch}
            title="View Architecture & PostgreSQL Schema"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Code2 className="w-4 h-4 text-indigo-500" />
            <span className="hidden lg:inline">PostgreSQL Spec</span>
          </button>

          {/* Reset Sample Data */}
          <button
            onClick={onResetData}
            title="Reset Sample Data"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Server Log Drawer Toggle */}
          <button
            onClick={toggleLog}
            title="Toggle Mock OTP Server Logs"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              isLogOpen
                ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Server Logs</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleDark}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
