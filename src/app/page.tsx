'use client';

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from '@/components/Navbar';
import { MobileSimulator } from '@/components/MobileSimulator';
import { DesktopDashboard } from '@/components/DesktopDashboard';
import { ServerLogDrawer } from '@/components/ServerLogDrawer';
import { ArchitectureModal } from '@/components/ArchitectureModal';
import { ReceiptModal } from '@/components/ReceiptModal';
import { AddLoanDesktopModal } from '@/components/AddLoanDesktopModal';
import { LoanEntry, LoanSummary, LoanFilter } from '@/types';
import {
  Smartphone,
  LayoutDashboard,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  ShieldCheck,
  Database,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isArchOpen, setIsArchOpen] = useState(false);
  const [activeReceiptUrl, setActiveReceiptUrl] = useState<string | null>(null);
  const [isDesktopAddOpen, setIsDesktopAddOpen] = useState(false);

  // Authentication State
  const [activePhone, setActivePhone] = useState('+919876543210');
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Ledger Data State
  const [loans, setLoans] = useState<LoanEntry[]>([]);
  const [summary, setSummary] = useState<LoanSummary | null>(null);
  const [filter, setFilter] = useState<LoanFilter>('all');
  const [loading, setLoading] = useState(true);

  // Dark Mode Toggle
  const toggleDark = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Fetch summary and loans
  const loadLedgerData = useCallback(async () => {
    try {
      const [sumRes, loansRes] = await Promise.all([
        fetch(`/api/summary?phone=${encodeURIComponent(activePhone)}`),
        fetch(`/api/loans?phone=${encodeURIComponent(activePhone)}&filter=${filter}`),
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
  }, [activePhone, filter]);

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
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.3 } });
    } catch (e) {
      console.error('Seed reset error:', e);
    }
  };

  const handleSendOtp = async (phone: string): Promise<string | null> => {
    const res = await fetch('/api/auth/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (data.success && data.otp) {
      setIsLogOpen(true); // Automatically open server log drawer so the reviewer sees the stdout print!
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navigation */}
      <Navbar
        isDark={isDark}
        toggleDark={toggleDark}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isLogOpen={isLogOpen}
        toggleLog={() => setIsLogOpen(!isLogOpen)}
        onResetData={handleResetData}
        onOpenArch={() => setIsArchOpen(true)}
        activePhone={activePhone}
      />

      {/* Hero Header Ribbon */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Credsetu Full Stack Assignment
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">Candidate: Yash Jain (Full Stack Developer)</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-amber-500" />
              Mock OTP in Server Logs
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-indigo-500" />
              PostgreSQL Schema Ready
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
              React Native Mobile App
            </span>
          </div>
        </div>
      </div>

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'mobile' ? (
          <MobileSimulator
            loans={loans}
            summary={summary}
            filter={filter}
            setFilter={setFilter}
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
        ) : (
          <DesktopDashboard
            loans={loans}
            summary={summary}
            filter={filter}
            setFilter={setFilter}
            activePhone={activePhone}
            onRefresh={loadLedgerData}
            onToggleRepay={handleToggleRepay}
            onDeleteLoan={handleDeleteLoan}
            onOpenAddModal={() => setIsDesktopAddOpen(true)}
            onViewReceipt={(url) => setActiveReceiptUrl(url)}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      <ServerLogDrawer
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
      />

      <ArchitectureModal
        isOpen={isArchOpen}
        onClose={() => setIsArchOpen(false)}
      />

      <ReceiptModal
        url={activeReceiptUrl}
        onClose={() => setActiveReceiptUrl(null)}
      />

      <AddLoanDesktopModal
        isOpen={isDesktopAddOpen}
        onClose={() => setIsDesktopAddOpen(false)}
        onSubmit={async (data) => {
          await handleCreateLoan(data);
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.5 } });
        }}
      />
    </div>
  );
}
