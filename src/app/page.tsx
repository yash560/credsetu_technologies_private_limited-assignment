'use client';

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Sidebar } from '@/components/Sidebar';
import { HeroBanner } from '@/components/HeroBanner';
import { QuickLedgerHub } from '@/components/QuickLedgerHub';
import { SplitBento } from '@/components/SplitBento';
import { PriorityActionLedger } from '@/components/PriorityActionLedger';
import { RightInspector } from '@/components/RightInspector';
import { ServerLogDrawer } from '@/components/ServerLogDrawer';
import { ArchitectureModal } from '@/components/ArchitectureModal';
import { ReceiptModal } from '@/components/ReceiptModal';
import { AddLoanDesktopModal } from '@/components/AddLoanDesktopModal';
import { WhatsAppReminderModal } from '@/components/WhatsAppReminderModal';
import { MobileSimulator } from '@/components/MobileSimulator';
import { LoanEntry, LoanSummary, LoanFilter } from '@/types';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Plus,
  Terminal,
  Code2,
  Smartphone,
  RotateCcw,
  Bell,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function Home() {
  // Theme State
  const [isDark, setIsDark] = useState(false); // Default to clean light mode matching concept image

  // Navigation & Category Filter
  const [activeCategory, setActiveCategory] = useState('all');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Modals & Drawers
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isArchOpen, setIsArchOpen] = useState(false);
  const [isMobileSimOpen, setIsMobileSimOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeReceiptUrl, setActiveReceiptUrl] = useState<string | null>(null);
  const [selectedReminderLoan, setSelectedReminderLoan] = useState<LoanEntry | null>(null);

  // Auth & Phone Context
  const [activePhone, setActivePhone] = useState('+919876543210');
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Ledger Data State
  const [loans, setLoans] = useState<LoanEntry[]>([]);
  const [summary, setSummary] = useState<LoanSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Dark Mode Toggle
  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Load Ledger Data
  const loadLedgerData = useCallback(async () => {
    try {
      const [sumRes, loansRes] = await Promise.all([
        fetch(`/api/summary?phone=${encodeURIComponent(activePhone)}`),
        fetch(`/api/loans?phone=${encodeURIComponent(activePhone)}&filter=all`),
      ]);

      const sumData = await sumRes.json();
      const loansData = await loansRes.json();

      if (sumData.success) setSummary(sumData.summary);
      if (loansData.success) setLoans(loansData.loans);
    } catch (err) {
      console.error('Error fetching ledger data:', err);
    } finally {
      setLoading(false);
    }
  }, [activePhone]);

  useEffect(() => {
    loadLedgerData();
  }, [loadLedgerData]);

  // Handlers
  const handleToggleRepay = async (id: string, currentRepaid: boolean) => {
    try {
      const res = await fetch(`/api/loans/${id}/repay`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_repaid: !currentRepaid }),
      });
      if (res.ok) {
        if (!currentRepaid) {
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
        }
        await loadLedgerData();
      }
    } catch (e) {
      console.error('Repayment toggle error:', e);
    }
  };

  const handleDeleteLoan = async (id: string) => {
    try {
      const res = await fetch(`/api/loans/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadLedgerData();
      }
    } catch (e) {
      console.error('Delete loan error:', e);
    }
  };

  const handleCreateLoan = async (data: {
    friend_name: string;
    amount: number;
    due_date: string;
    notes?: string;
    receipt_url?: string;
  }) => {
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-phone': activePhone,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await loadLedgerData();
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.5 } });
      }
    } catch (e) {
      console.error('Create loan error:', e);
    }
  };

  const handleResetData = async () => {
    try {
      await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: activePhone }),
      });
      await loadLedgerData();
      confetti({ particleCount: 35, spread: 70, origin: { y: 0.3 } });
    } catch (e) {
      console.error('Seed reset error:', e);
    }
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Friend Name', 'Amount (INR)', 'Due Date', 'Status', 'Repaid At', 'Notes'];
    const rows = loans.map((l) => [
      l.id,
      `"${l.friend_name}"`,
      l.amount,
      l.due_date,
      l.is_repaid ? 'REPAID' : l.is_overdue ? 'OVERDUE' : 'ACTIVE',
      l.repaid_at || '',
      `"${l.notes || ''}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `miniledger_${activePhone}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // OTP handlers for mobile simulator
  const handleSendOtp = async (phone: string): Promise<string | null> => {
    const res = await fetch('/api/auth/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (data.success && data.otp) {
      setIsLogOpen(true);
      return data.otp;
    }
    return null;
  };

  const handleVerifyOtp = async (phone: string, otp: string): Promise<boolean> => {
    const res = await fetch('/api/auth/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    });
    const data = await res.json();
    return Boolean(data.success);
  };

  // Filter loans based on active sidebar category
  const displayedLoans = loans.filter((l) => {
    if (activeCategory === 'overdue') return l.is_overdue && !l.is_repaid;
    if (activeCategory === 'settled') return l.is_repaid;
    if (activeCategory === 'dining') return l.notes?.toLowerCase().includes('dinner') || l.notes?.toLowerCase().includes('dining');
    if (activeCategory === 'trips') return l.notes?.toLowerCase().includes('trip') || l.notes?.toLowerCase().includes('flight') || l.notes?.toLowerCase().includes('goa');
    if (activeCategory === 'bills') return l.notes?.toLowerCase().includes('rent') || l.notes?.toLowerCase().includes('bill');
    if (activeCategory === 'cash') return l.notes?.toLowerCase().includes('cash');
    return true;
  });

  const overdueCount = loans.filter((l) => l.is_overdue && !l.is_repaid).length;
  const upcomingCount = loans.filter((l) => !l.is_overdue && !l.is_repaid).length;
  const upcomingAmount = loans
    .filter((l) => !l.is_overdue && !l.is_repaid)
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070b12] text-slate-900 dark:text-slate-100 flex transition-colors selection:bg-emerald-500/20 selection:text-emerald-700">
      {/* Zone 1: Left Navigation Rail */}
      <Sidebar
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        overdueCount={overdueCount}
        friendsCount={new Set(loans.map((l) => l.friend_name)).size}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        onOpenAssistant={() => {
          if (loans.length > 0) {
            setSelectedReminderLoan(loans[0]);
          }
        }}
      />

      {/* Main Workspace Cockpit (Zone 2 + Zone 3) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-[#0d131f]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Mobile hamburger & Search */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Bar */}
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search friends, debts, receipts... (Press / to focus)"
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-100/70 dark:bg-[#121824] border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-[#0c121e] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-2">
            {/* React Native Mobile Simulator Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileSimOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/60 dark:border-white/5 transition-all"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Mobile App</span>
            </button>

            {/* PostgreSQL Spec DDL */}
            <button
              type="button"
              onClick={() => setIsArchOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/60 dark:border-white/5 transition-all"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Database DDL</span>
            </button>

            {/* Server Logs Drawer */}
            <button
              type="button"
              onClick={() => setIsLogOpen(!isLogOpen)}
              title="Inspect backend stdout & OTPs"
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <Terminal className="w-4 h-4 text-amber-500" />
            </button>

            {/* Reset Sample Seed */}
            <button
              type="button"
              onClick={handleResetData}
              title="Reset sample loan entries"
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleDark}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Primary Add Loan CTA */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">+ Record Loan</span>
            </button>
          </div>
        </header>

        {/* Cockpit Canvas: Zone 2 (Center) + Zone 3 (Right) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
            {/* Zone 2: Center Stage Content (Col-Span) */}
            <div className="flex-1 min-w-0 space-y-7 w-full">
              {/* 2A: Hero Greeting Card */}
              <HeroBanner
                overdueCount={overdueCount}
                upcomingCount={upcomingCount}
                upcomingAmount={upcomingAmount}
                onRecordClick={() => setIsAddModalOpen(true)}
              />

              {/* 2B: Quick Ledger Hub (Inline Fast Recording) */}
              <QuickLedgerHub
                onLoanCreated={loadLedgerData}
                activePhone={activePhone}
              />

              {/* 2C: Bento Grid Performance Metrics */}
              <SplitBento
                summary={summary}
                onOpenReminderModal={() => {
                  const overdueLoan = loans.find((l) => l.is_overdue && !l.is_repaid) || loans[0];
                  if (overdueLoan) setSelectedReminderLoan(overdueLoan);
                }}
              />

              {/* 2D: Priority Repayments & Follow-ups Table */}
              <PriorityActionLedger
                loans={displayedLoans}
                onToggleRepay={handleToggleRepay}
                onDeleteLoan={handleDeleteLoan}
                onViewReceipt={(url) => setActiveReceiptUrl(url)}
                onSendReminder={(loan) => setSelectedReminderLoan(loan)}
              />
            </div>

            {/* Zone 3: Right Inspector Rail */}
            <RightInspector
              loans={loans}
              summary={summary}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onOpenReminderModal={() => {
                const overdueLoan = loans.find((l) => l.is_overdue && !l.is_repaid) || loans[0];
                if (overdueLoan) setSelectedReminderLoan(overdueLoan);
              }}
              onExportCsv={handleExportCsv}
              onOpenAssistant={() => {
                if (loans.length > 0) setSelectedReminderLoan(loans[0]);
              }}
            />
          </div>
        </main>
      </div>

      {/* Modals & Overlays */}
      <WhatsAppReminderModal
        isOpen={Boolean(selectedReminderLoan)}
        loan={selectedReminderLoan}
        onClose={() => setSelectedReminderLoan(null)}
      />

      <AddLoanDesktopModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (data) => {
          await handleCreateLoan(data);
        }}
      />

      <ReceiptModal
        url={activeReceiptUrl}
        onClose={() => setActiveReceiptUrl(null)}
      />

      <ArchitectureModal
        isOpen={isArchOpen}
        onClose={() => setIsArchOpen(false)}
      />

      <ServerLogDrawer
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
      />

      {/* React Native Mobile Simulator Modal */}
      {isMobileSimOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsMobileSimOpen(false)}
              className="absolute -top-10 right-0 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors"
            >
              ✕ Close Simulator
            </button>
            <MobileSimulator
              loans={loans}
              summary={summary}
              filter="all"
              setFilter={() => {}}
              activePhone={activePhone}
              setActivePhone={setActivePhone}
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={setIsLoggedIn}
              onRefresh={loadLedgerData}
              onToggleRepay={handleToggleRepay}
              onCreateLoan={handleCreateLoan}
              onSendOtp={handleSendOtp}
              onVerifyOtp={handleVerifyOtp}
              onViewReceipt={(url) => setActiveReceiptUrl(url)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
