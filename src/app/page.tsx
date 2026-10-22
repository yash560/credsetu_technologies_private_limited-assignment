'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { AuthModal } from '@/components/AuthModal';
import { SkeletonCockpit } from '@/components/SkeletonCockpit';
import { FriendsDirectoryView } from '@/components/views/FriendsDirectoryView';
import { RepaymentScheduleView } from '@/components/views/RepaymentScheduleView';
import { ReceiptsGalleryView } from '@/components/views/ReceiptsGalleryView';
import { MonthlyAnalyticsView } from '@/components/views/MonthlyAnalyticsView';
import { SpaceDetailView } from '@/components/views/SpaceDetailView';
import { LoanEntry, LoanSummary, LoanFilter, UserAccount } from '@/types';
import { tactile } from '@/lib/tactileFeedback';
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
  Undo2,
  UserCheck,
  X,
} from 'lucide-react';

export default function Home() {
  // Theme State
  const [isDark, setIsDark] = useState(false);

  // Navigation & Category Filter
  const [activeCategory, setActiveCategory] = useState('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Search State & Keyboard Ref
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Modals & Drawers
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isArchOpen, setIsArchOpen] = useState(false);
  const [isMobileSimOpen, setIsMobileSimOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeReceiptUrl, setActiveReceiptUrl] = useState<string | null>(null);
  const [selectedReminderLoan, setSelectedReminderLoan] = useState<LoanEntry | null>(null);
  const [prefillFriendName, setPrefillFriendName] = useState<string | undefined>();
  const [prefillNotes, setPrefillNotes] = useState<string | undefined>();

  // Optimistic Undo Toast
  const [undoAction, setUndoAction] = useState<{
    text: string;
    undo: () => Promise<void>;
  } | null>(null);

  // Auth & Identity State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [activePhone, setActivePhone] = useState('+919876543210');
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Ledger Data State
  const [loans, setLoans] = useState<LoanEntry[]>([]);
  const [summary, setSummary] = useState<LoanSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Authenticated Session & Stored Phone
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
          if (data.user.phone) setActivePhone(data.user.phone);
        } else {
          const stored = localStorage.getItem('miniledger_user');
          if (stored) {
            try {
              const u = JSON.parse(stored);
              setCurrentUser(u);
              if (u.phone) setActivePhone(u.phone);
            } catch {}
          }
        }
      })
      .catch(() => {
        const stored = localStorage.getItem('miniledger_user');
        if (stored) {
          try {
            const u = JSON.parse(stored);
            setCurrentUser(u);
            if (u.phone) setActivePhone(u.phone);
          } catch {}
        }
      });
  }, []);

  const handleAuthSuccess = (user: UserAccount, token: string) => {
    setCurrentUser(user);
    if (user.phone) setActivePhone(user.phone);
    if (typeof window !== 'undefined') {
      localStorage.setItem('miniledger_user', JSON.stringify(user));
      localStorage.setItem('miniledger_token', token);
      if (user.phone) localStorage.setItem('miniledger_phone', user.phone);
    }
    loadLedgerData();
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('miniledger_user');
      localStorage.removeItem('miniledger_token');
    }
    loadLedgerData();
  };

  // Global Keyboard Shortcut: '/' to focus search, 'Escape' to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
        tactile.subtle();
      } else if (e.key === 'Escape') {
        if (searchQuery) setSearchQuery('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  // Dark Mode Toggle
  const toggleDark = () => {
    tactile.subtle();
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
      setLoading(true);
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
    tactile.tap();
    try {
      const res = await fetch(`/api/loans/${id}/repay`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_repaid: !currentRepaid }),
      });
      if (res.ok) {
        if (!currentRepaid) {
          tactile.success();
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
        }
        await loadLedgerData();

        // Trigger optimistic undo toast
        setUndoAction({
          text: currentRepaid ? 'Marked as pending' : 'Marked as settled',
          undo: async () => {
            await fetch(`/api/loans/${id}/repay`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ is_repaid: currentRepaid }),
            });
            await loadLedgerData();
          },
        });
        setTimeout(() => setUndoAction(null), 5000);
      }
    } catch (e) {
      console.error('Repayment toggle error:', e);
      tactile.warning();
    }
  };

  const handleDeleteLoan = async (id: string) => {
    tactile.warning();
    try {
      const deletedLoan = loans.find((l) => l.id === id);
      const res = await fetch(`/api/loans/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadLedgerData();

        if (deletedLoan) {
          setUndoAction({
            text: `Deleted loan for ${deletedLoan.friend_name}`,
            undo: async () => {
              await fetch('/api/loans', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-user-phone': activePhone,
                },
                body: JSON.stringify({
                  phone: deletedLoan.phone,
                  friend_name: deletedLoan.friend_name,
                  amount: deletedLoan.amount,
                  due_date: deletedLoan.due_date,
                  notes: deletedLoan.notes,
                  receipt_url: deletedLoan.receipt_url,
                }),
              });
              await loadLedgerData();
            },
          });
          setTimeout(() => setUndoAction(null), 5000);
        }
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
        tactile.success();
        await loadLedgerData();
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.5 } });
      }
    } catch (e) {
      console.error('Create loan error:', e);
      tactile.warning();
    }
  };

  const handleResetData = async () => {
    tactile.tap();
    try {
      await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: activePhone }),
      });
      await loadLedgerData();
      tactile.success();
      confetti({ particleCount: 35, spread: 70, origin: { y: 0.3 } });
    } catch (e) {
      console.error('Seed reset error:', e);
      tactile.warning();
    }
  };

  const handleExportCsv = () => {
    tactile.subtle();
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

  // Filter loans based on search query
  const searchedLoans = loans.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchName = l.friend_name.toLowerCase().includes(q);
    const matchNotes = l.notes?.toLowerCase().includes(q) ?? false;
    const matchAmt = l.amount.toString().includes(q);
    const matchDate = l.due_date.includes(q);
    return matchName || matchNotes || matchAmt || matchDate;
  });

  const overdueCount = loans.filter((l) => l.is_overdue && !l.is_repaid).length;
  const upcomingCount = loans.filter((l) => !l.is_overdue && !l.is_repaid).length;
  const upcomingAmount = loans
    .filter((l) => !l.is_overdue && !l.is_repaid)
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Render the current view according to activeCategory
  const renderCurrentView = () => {
    if (activeCategory === 'friends') {
      return (
        <FriendsDirectoryView
          loans={searchedLoans}
          onSendReminder={(loan) => setSelectedReminderLoan(loan)}
          onOpenAddModal={(name) => {
            setPrefillFriendName(name);
            setIsAddModalOpen(true);
          }}
          onToggleRepay={handleToggleRepay}
        />
      );
    }

    if (activeCategory === 'schedule') {
      return (
        <RepaymentScheduleView
          loans={searchedLoans}
          onSendReminder={(loan) => setSelectedReminderLoan(loan)}
          onToggleRepay={handleToggleRepay}
        />
      );
    }

    if (activeCategory === 'receipts') {
      return (
        <ReceiptsGalleryView
          loans={searchedLoans}
          onViewReceipt={(url) => setActiveReceiptUrl(url)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />
      );
    }

    if (activeCategory === 'analytics') {
      return (
        <MonthlyAnalyticsView
          loans={searchedLoans}
          summary={summary}
        />
      );
    }

    if (['dining', 'trips', 'bills', 'cash'].includes(activeCategory)) {
      return (
        <SpaceDetailView
          spaceId={activeCategory}
          loans={searchedLoans}
          onOpenAddModal={(notes) => {
            setPrefillNotes(notes);
            setIsAddModalOpen(true);
          }}
          onSendReminder={(loan) => setSelectedReminderLoan(loan)}
          onToggleRepay={handleToggleRepay}
          onViewReceipt={(url) => setActiveReceiptUrl(url)}
        />
      );
    }

    // Default: Master 3-Zone Cockpit
    return (
      <div className="space-y-7">
        {/* 2A: Hero Greeting Card */}
        <HeroBanner
          overdueCount={overdueCount}
          upcomingCount={upcomingCount}
          upcomingAmount={upcomingAmount}
          userName={currentUser?.name}
          onRecordClick={() => setIsAddModalOpen(true)}
        />

        {/* 2B: Quick Ledger Hub */}
        <QuickLedgerHub
          onLoanCreated={loadLedgerData}
          activePhone={activePhone}
        />

        {/* 2C: Split Bento Performance Section */}
        <SplitBento
          summary={summary}
          onOpenReminderModal={() => {
            const overdueLoan = loans.find((l) => l.is_overdue && !l.is_repaid) || loans[0];
            if (overdueLoan) setSelectedReminderLoan(overdueLoan);
          }}
        />

        {/* 2D: Priority Action Ledger */}
        <PriorityActionLedger
          loans={searchedLoans}
          onToggleRepay={handleToggleRepay}
          onDeleteLoan={handleDeleteLoan}
          onViewReceipt={(url) => setActiveReceiptUrl(url)}
          onSendReminder={(loan) => setSelectedReminderLoan(loan)}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070b12] text-slate-900 dark:text-slate-100 flex transition-colors selection:bg-emerald-500/20 selection:text-emerald-700">
      {/* Zone 1: Left Navigation Rail */}
      <Sidebar
        activeCategory={activeCategory}
        setActiveCategory={(cat) => {
          setActiveCategory(cat);
          setSearchQuery('');
        }}
        overdueCount={overdueCount}
        friendsCount={new Set(loans.map((l) => l.friend_name)).size}
        receiptsCount={loans.filter((l) => Boolean(l.receipt_url)).length}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        onOpenAssistant={() => {
          if (loans.length > 0) setSelectedReminderLoan(loans[0]);
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        activePhone={activePhone}
        currentUser={currentUser}
      />

      {/* Main Workspace Cockpit (Zone 2 + Zone 3) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/85 dark:bg-[#0d131f]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Mobile hamburger & Functional Search */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              type="button"
              onClick={() => {
                tactile.tap();
                setIsMobileNavOpen(true);
              }}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 touch-icon"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Bar with Keyboard Shortcut */}
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 touch-icon" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search friends, debts, receipts... (Press / to focus)"
                className="w-full h-10 pl-10 pr-9 rounded-xl bg-slate-100/70 dark:bg-[#121824] border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-[#0c121e] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden transition-all"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    tactile.subtle();
                    setSearchQuery('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-slate-200/80 dark:bg-white/10 text-[10px] font-mono text-slate-400">
                  /
                </span>
              )}
            </div>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-2">
            {/* Account Profile / Sign In Pill */}
            <button
              type="button"
              onClick={() => {
                tactile.tap();
                setIsAuthModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/60 dark:border-white/5 transition-all touch-icon"
            >
              <div className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center">
                {currentUser?.name ? currentUser.name[0].toUpperCase() : '✦'}
              </div>
              <span className="truncate max-w-[120px]">
                {currentUser?.name ? currentUser.name : 'Sign In / Account'}
              </span>
            </button>

            {/* React Native Mobile Simulator Modal Trigger */}
            <button
              type="button"
              onClick={() => {
                tactile.tap();
                setIsMobileSimOpen(true);
              }}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/60 dark:border-white/5 transition-all touch-icon"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Mobile App</span>
            </button>

            {/* PostgreSQL Spec DDL */}
            <button
              type="button"
              onClick={() => {
                tactile.subtle();
                setIsArchOpen(true);
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/60 dark:border-white/5 transition-all touch-icon"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>DDL Spec</span>
            </button>

            {/* Server Logs Drawer */}
            <button
              type="button"
              onClick={() => {
                tactile.tap();
                setIsLogOpen(!isLogOpen);
              }}
              title="Inspect backend stdout & OTPs"
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors touch-icon"
            >
              <Terminal className="w-4 h-4 text-amber-500" />
            </button>

            {/* Reset Sample Seed */}
            <button
              type="button"
              onClick={handleResetData}
              title="Reset sample loan entries"
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors icon-spin-hover"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleDark}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors touch-icon"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Primary Add Loan CTA */}
            <button
              type="button"
              onClick={() => {
                tactile.tap();
                setPrefillFriendName(undefined);
                setPrefillNotes(undefined);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all tactile-btn"
            >
              <Plus className="w-4 h-4 touch-icon" />
              <span className="hidden sm:inline">+ Record Loan</span>
            </button>
          </div>
        </header>

        {/* Search Results Ribbon if active */}
        {searchQuery && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-2.5 flex items-center justify-between text-xs animate-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">
                Search Results for &ldquo;{searchQuery}&rdquo;:
              </span>
              <span className="text-emerald-700/80 dark:text-emerald-400">
                Found {searchedLoans.length} matching debts
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* Cockpit Canvas: Zone 2 + Zone 3 */}
        {loading ? (
          <SkeletonCockpit />
        ) : (
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
              {/* Zone 2: Dynamic Center Stage View */}
              <div className="flex-1 min-w-0 w-full">
                {renderCurrentView()}
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
        )}
      </div>

      {/* Optimistic Undo Toast Capsule */}
      {undoAction && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900 text-white shadow-2xl border border-white/10 animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{undoAction.text}</span>
          <button
            type="button"
            onClick={async () => {
              tactile.tap();
              await undoAction.undo();
              setUndoAction(null);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold text-[11px] transition-colors"
          >
            <Undo2 className="w-3 h-3" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {/* Modals & Overlays */}
      <WhatsAppReminderModal
        isOpen={Boolean(selectedReminderLoan)}
        loan={selectedReminderLoan}
        onClose={() => setSelectedReminderLoan(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={handleAuthSuccess}
        onLogout={handleLogout}
      />

      <AddLoanDesktopModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setPrefillFriendName(undefined);
          setPrefillNotes(undefined);
        }}
        onSubmit={async (data) => {
          await handleCreateLoan({
            ...data,
            friend_name: prefillFriendName || data.friend_name,
            notes: prefillNotes ? `${prefillNotes} · ${data.notes || ''}` : data.notes,
          });
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
              onClick={() => {
                tactile.subtle();
                setIsMobileSimOpen(false);
              }}
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
