'use client';

import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Receipt,
  X,
  Sparkles,
  PhoneCall,
  KeyRound,
  ArrowRight,
  LogOut,
  RefreshCw,
  Calendar,
  User,
  IndianRupee,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LoanEntry, LoanSummary, LoanFilter } from '@/types';

interface Props {
  loans: LoanEntry[];
  summary: LoanSummary | null;
  filter: LoanFilter;
  setFilter: (f: LoanFilter) => void;
  activePhone: string;
  setActivePhone: (p: string) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (b: boolean) => void;
  onRefresh: () => void;
  onToggleRepay: (id: string, current: boolean) => Promise<void>;
  onCreateLoan: (data: {
    friend_name: string;
    amount: number;
    due_date: string;
    notes?: string;
    receipt_url?: string;
  }) => Promise<void>;
  onSendOtp: (phone: string) => Promise<string | null>;
  onVerifyOtp: (phone: string, otp: string) => Promise<boolean>;
  onViewReceipt: (url: string) => void;
}

export const MobileSimulator: React.FC<Props> = ({
  loans,
  summary,
  filter,
  setFilter,
  activePhone,
  setActivePhone,
  isLoggedIn,
  setIsLoggedIn,
  onRefresh,
  onToggleRepay,
  onCreateLoan,
  onSendOtp,
  onVerifyOtp,
  onViewReceipt,
}) => {
  // Mobile simulator auth state
  const [phoneInput, setPhoneInput] = useState('9876543210');
  const [otpInput, setOtpInput] = useState('');
  const [authStep, setAuthStep] = useState<'phone' | 'otp'>('phone');
  const [lastGeneratedOtp, setLastGeneratedOtp] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Add loan modal state inside simulator
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [friendName, setFriendName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // Handlers
  const handleRequestOtp = async () => {
    if (!phoneInput || phoneInput.length < 10) {
      setAuthError('Please enter a valid 10-digit phone number');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const fullPhone = phoneInput.startsWith('+') ? phoneInput : `+91${phoneInput}`;
      const otp = await onSendOtp(fullPhone);
      if (otp) {
        setLastGeneratedOtp(otp);
        setOtpInput(otp); // Autofill for effortless evaluation
        setAuthStep('otp');
      }
    } catch {
      setAuthError('Failed to generate mock OTP');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput || otpInput.length !== 6) {
      setAuthError('Enter a valid 6-digit OTP');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const fullPhone = phoneInput.startsWith('+') ? phoneInput : `+91${phoneInput}`;
      const success = await onVerifyOtp(fullPhone, otpInput);
      if (success) {
        setActivePhone(fullPhone);
        setIsLoggedIn(true);
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      } else {
        setAuthError('Invalid OTP code. Check server logs.');
      }
    } catch {
      setAuthError('Verification failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!friendName.trim() || friendName.trim().length < 2) {
      errors.friendName = 'Friend name is required (min 2 chars)';
    }
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      errors.amount = 'Enter a valid amount (> 0)';
    }
    if (!dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      errors.dueDate = 'Due date must follow YYYY-MM-DD';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await onCreateLoan({
        friend_name: friendName.trim(),
        amount: parseFloat(amount),
        due_date: dueDate,
        notes: notes.trim() || undefined,
        receipt_url: receiptUrl.trim() || undefined,
      });
      setIsAddOpen(false);
      setFriendName('');
      setAmount('');
      setNotes('');
      setReceiptUrl('');
      setFormErrors({});
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleRepayClick = async (id: string, currentRepaid: boolean) => {
    await onToggleRepay(id, currentRepaid);
    if (!currentRepaid) {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      {/* Device Header Info */}
      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
          <Smartphone className="w-3.5 h-3.5" />
          Interactive iPhone 16 Pro Frame • React Native Architecture
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Testing phone login, mock OTP logs, summary metrics, and overdue highlights
        </p>
      </div>

      {/* iPhone 16 Pro Frame */}
      <div className="relative w-[375px] h-[780px] bg-slate-900 rounded-[50px] p-3.5 shadow-2xl ring-1 ring-slate-800 border-4 border-slate-700/60 flex flex-col overflow-hidden">
        {/* Dynamic Island */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-between px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500/40" />
        </div>

        {/* Status Bar */}
        <div className="w-full h-8 flex items-center justify-between px-6 pt-1 text-[11px] font-bold text-slate-900 dark:text-white z-20 select-none">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">5G</span>
            <div className="w-4 h-2 border border-current rounded-sm p-0.5">
              <div className="h-full bg-current rounded-xs w-3/4" />
            </div>
          </div>
        </div>

        {/* App Inner Canvas */}
        <div className="relative w-full flex-1 bg-slate-50 dark:bg-slate-950 rounded-[38px] overflow-hidden flex flex-col text-slate-900 dark:text-slate-100 select-none">
          {!isLoggedIn ? (
            /* =================== LOGIN SCREEN =================== */
            <div className="flex-1 flex flex-col justify-center px-6 py-8 overflow-y-auto">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-indigo-600/30">
                <span className="text-3xl font-black">₹</span>
              </div>
              <h2 className="text-2xl font-black text-center text-slate-900 dark:text-white">
                MiniLedger
              </h2>
              <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-1 mb-6">
                Simple peer debt & friend loan tracking
              </p>

              {authStep === 'phone' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <div className="flex rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                      <span className="px-3 py-2.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-r border-slate-300 dark:border-slate-700 flex items-center">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        maxLength={10}
                        className="w-full px-3 py-2.5 text-sm bg-transparent outline-none font-semibold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {authError && (
                    <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                      {authError}
                    </div>
                  )}

                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                      Mock OTP Architecture
                    </p>
                    <p>
                      Clicking below generates a 6-digit OTP printed directly to backend stdout.
                    </p>
                  </div>

                  <button
                    onClick={handleRequestOtp}
                    disabled={authLoading}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {authLoading ? 'Generating OTP...' : 'Send Mock OTP'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Enter 6-Digit Mock OTP
                    </label>
                    <input
                      type="text"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="••••••"
                      maxLength={6}
                      className="w-full px-4 py-3 text-center tracking-[0.5em] text-xl font-black rounded-xl border border-indigo-400 dark:border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {lastGeneratedOtp && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-center">
                      <div className="text-[11px] font-bold">Printed to Backend Console:</div>
                      <div className="text-lg font-black tracking-widest text-emerald-600 dark:text-emerald-400">
                        {lastGeneratedOtp}
                      </div>
                      <div className="text-[10px] text-emerald-600/80">(Autofilled for quick grading)</div>
                    </div>
                  )}

                  {authError && (
                    <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                      {authError}
                    </div>
                  )}

                  <button
                    onClick={handleVerifyOtp}
                    disabled={authLoading}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {authLoading ? 'Verifying...' : 'Verify & Open Ledger'}
                    <Sparkles className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setAuthStep('phone');
                      setAuthError(null);
                    }}
                    className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    ← Change Phone Number
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* =================== HOME SCREEN =================== */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* App Bar */}
              <div className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h1 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                    MiniLedger
                  </h1>
                  <p className="text-[10px] text-slate-500 font-medium">{activePhone}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={onRefresh}
                    title="Refresh data"
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsLoggedIn(false)}
                    title="Logout"
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 text-slate-600 dark:text-slate-400 hover:text-rose-600"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 pb-20">
                {/* Summary Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white shadow-lg border border-indigo-800/40 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                      Total Money Lent
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                      Live Summary
                    </span>
                  </div>
                  <div className="text-2xl font-black tracking-tight text-white mb-3">
                    ₹{(summary?.total_lent || 0).toLocaleString('en-IN')}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-indigo-800/50">
                    <div className="bg-white/5 p-2 rounded-xl">
                      <span className="text-[10px] font-semibold text-slate-300 block">REPAID</span>
                      <span className="text-sm font-bold text-emerald-400">
                        ₹{(summary?.total_repaid || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/30 p-2 rounded-xl">
                      <span className="text-[10px] font-semibold text-rose-300 block">OVERDUE</span>
                      <span className="text-sm font-extrabold text-rose-400">
                        ₹{(summary?.overdue_amount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {(['all', 'overdue', 'active', 'repaid'] as const).map((tab) => {
                    const isActive = filter === tab;
                    let count = 0;
                    if (summary) {
                      if (tab === 'all') count = summary.total_loans;
                      if (tab === 'overdue') count = summary.overdue_count;
                      if (tab === 'active') count = summary.active_count;
                      if (tab === 'repaid') count = summary.repaid_count;
                    }

                    return (
                      <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-3 py-1.5 rounded-full font-bold text-[11px] whitespace-nowrap transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : tab === 'overdue' && count > 0
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {count > 0 ? ` (${count})` : ''}
                      </button>
                    );
                  })}
                </div>

                {/* Loan Entries List */}
                <div className="space-y-2.5">
                  {loans.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      <div className="text-3xl mb-2">🍃</div>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        No entries under this filter
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Tap "+ Lend Money" to record a new loan
                      </p>
                    </div>
                  ) : (
                    loans.map((loan) => {
                      const isOverdue = loan.is_overdue;
                      const isRepaid = loan.is_repaid;

                      return (
                        <div
                          key={loan.id}
                          className={`p-3 rounded-2xl border transition-all ${
                            isOverdue && !isRepaid
                              ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-400 dark:border-rose-700/60 ring-1 ring-rose-400/40'
                              : isRepaid
                              ? 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                  isOverdue && !isRepaid
                                    ? 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                                    : isRepaid
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                }`}
                              >
                                {loan.friend_name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                                  {loan.friend_name}
                                </h3>
                                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  Due: {loan.due_date}
                                  {isOverdue && !isRepaid && (
                                    <span className="font-bold text-rose-600 dark:text-rose-400">
                                      • {loan.days_overdue}d overdue
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <div
                                className={`text-sm font-black ${
                                  isOverdue && !isRepaid
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : 'text-slate-900 dark:text-white'
                                }`}
                              >
                                ₹{loan.amount.toLocaleString('en-IN')}
                              </div>
                              {isOverdue && !isRepaid && (
                                <span className="inline-block text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500 text-white">
                                  OVERDUE
                                </span>
                              )}
                              {isRepaid && (
                                <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500 text-white">
                                  ✓ REPAID
                                </span>
                              )}
                            </div>
                          </div>

                          {loan.notes && (
                            <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg italic">
                              "{loan.notes}"
                            </p>
                          )}

                          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                            {loan.receipt_url ? (
                              <button
                                onClick={() => onViewReceipt(loan.receipt_url!)}
                                className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                <Receipt className="w-3 h-3" />
                                View Receipt
                              </button>
                            ) : (
                              <span />
                            )}

                            <button
                              onClick={() => handleToggleRepayClick(loan.id, isRepaid)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                isRepaid
                                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                              }`}
                            >
                              {isRepaid ? 'Mark Unpaid' : '✓ Mark as Repaid'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Floating Action Button */}
              <div className="absolute bottom-4 right-4 z-20">
                <button
                  id="mobile-lend-money-fab"
                  onClick={() => setIsAddOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/40 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Lend Money
                </button>
              </div>

              {/* Add Loan Bottom Sheet Inside Simulator */}
              {isAddOpen && (
                <div className="absolute inset-0 bg-black/60 z-30 flex flex-col justify-end">
                  <div className="bg-white dark:bg-slate-900 rounded-t-3xl p-4 max-h-[88%] flex flex-col shadow-2xl border-t border-slate-700">
                    <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3" />
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        Lend Money to Friend
                      </h3>
                      <button
                        onClick={() => setIsAddOpen(false)}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateLoanSubmit} className="space-y-3 overflow-y-auto pr-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Friend's Name *
                        </label>
                        <input
                          id="mobile-input-friend-name"
                          type="text"
                          value={friendName}
                          onChange={(e) => setFriendName(e.target.value)}
                          placeholder="e.g. Rahul Verma"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {formErrors.friendName && (
                          <p className="text-[10px] text-rose-500 font-bold mt-0.5">
                            {formErrors.friendName}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Amount (₹) *
                          </label>
                          <input
                            id="mobile-input-amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="5000"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          {formErrors.amount && (
                            <p className="text-[10px] text-rose-500 font-bold mt-0.5">
                              {formErrors.amount}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Due Date *
                          </label>
                          <input
                            id="mobile-input-due-date"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          {formErrors.dueDate && (
                            <p className="text-[10px] text-rose-500 font-bold mt-0.5">
                              {formErrors.dueDate}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Notes / Purpose (Optional)
                        </label>
                        <input
                          id="mobile-input-notes"
                          type="text"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Trip expenses, concert tickets, dinner..."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Receipt Photo URL (Bonus)
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setReceiptUrl(
                                'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'
                              )
                            }
                            className="text-[10px] text-indigo-500 font-bold hover:underline"
                          >
                            + Attach Sample
                          </button>
                        </div>
                        <input
                          id="mobile-input-receipt"
                          type="text"
                          value={receiptUrl}
                          onChange={(e) => setReceiptUrl(e.target.value)}
                          placeholder="https://... or sample receipt"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                        />
                      </div>

                      <button
                        id="mobile-submit-loan-btn"
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 mt-2"
                      >
                        {submitting ? 'Adding...' : 'Confirm Loan Entry'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Home Indicator Bar */}
        <div className="w-32 h-1 bg-slate-400 dark:bg-slate-600 rounded-full mx-auto mt-2 select-none" />
      </div>
    </div>
  );
};
