'use client';

import React, { useState } from 'react';
import {
  IndianRupee,
  Calendar,
  Tag,
  Paperclip,
  Plus,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface QuickLedgerHubProps {
  onLoanCreated: () => void;
  activePhone: string;
}

export const QuickLedgerHub: React.FC<QuickLedgerHubProps> = ({
  onLoanCreated,
  activePhone,
}) => {
  const [friendName, setFriendName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('Dinner & Drinks');
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [showAttachReceipt, setShowAttachReceipt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Preset frequent friends for 1-click fill
  const frequentFriends = ['Rohan Verma', 'Priya Sharma', 'Ankit Gupta', 'Kavita Patel'];

  const triggerHaptic = (ms = 4) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([ms]); } catch (_) {}
    }
  };

  const handleQuickDueDate = (days: number) => {
    triggerHaptic(2);
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDueDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!friendName.trim()) {
      setErrorMsg('Please specify who borrowed the money.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount in ₹.');
      return;
    }
    if (!dueDate) {
      setErrorMsg('Please select a repayment due date.');
      return;
    }

    setIsSubmitting(true);
    triggerHaptic(6);

    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: activePhone,
          friend_name: friendName.trim(),
          amount: numAmount,
          due_date: dueDate,
          notes: notes.trim() ? `${category} · ${notes.trim()}` : category,
          receipt_url: receiptUrl.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record loan');
      }

      setSuccessMsg(`₹${numAmount.toLocaleString('en-IN')} lent to ${friendName} recorded.`);
      setFriendName('');
      setAmount('');
      setDueDate('');
      setNotes('');
      setReceiptUrl('');
      setShowAttachReceipt(false);
      onLoanCreated();

      setTimeout(() => {
        setSuccessMsg('');
      }, 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            ⚡
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Quick Record Lent Money
          </h2>
        </div>

        {/* Quick friend chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
            Recent:
          </span>
          {frequentFriends.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                triggerHaptic(2);
                setFriendName(f);
              }}
              className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-medium text-[11px] transition-colors whitespace-nowrap"
            >
              {f.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Grid: Name, Amount, Due Date, Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Who borrowed */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Who Borrowed?
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Friend's Name"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#121927] border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Amount in ₹ */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              ₹ Amount
            </label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                placeholder="500"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#121927] border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* When is it due? */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                When Is It Due?
              </label>
              <div className="flex items-center gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => handleQuickDueDate(3)}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  +3d
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => handleQuickDueDate(7)}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  +7d
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#121927] border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Category
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-[#121927] border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all appearance-none"
              >
                <option value="Dinner & Drinks">Dinner &amp; Drinks</option>
                <option value="Weekend Trips">Weekend Trips</option>
                <option value="Rent & Utilities">Rent &amp; Utilities</option>
                <option value="Emergency Cash">Emergency Cash</option>
                <option value="Split Bill / Shopping">Split Bill / Shopping</option>
                <option value="General Lending">General Lending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Optional Row: Receipt URL & Notes Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(2);
                setShowAttachReceipt(!showAttachReceipt);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <Paperclip className="w-3.5 h-3.5" />
              {showAttachReceipt ? 'Hide Receipt & Note' : 'Attach Bill Photo or Note'}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-sm tracking-wide shadow-md shadow-emerald-600/25 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="inline-block animate-spin">⏳</span>
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>+ Record Loan</span>
          </button>
        </div>

        {/* Collapsible Receipt URL / Note input */}
        {showAttachReceipt && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121927] border border-slate-200/60 dark:border-white/5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Note / Purpose
              </label>
              <input
                type="text"
                placeholder="e.g. Goa flights split, Zomato order"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Receipt / Screenshot URL
              </label>
              <input
                type="url"
                placeholder="https://res.cloudinary.com/... or image link"
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Inline Alerts */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}
      </form>
    </div>
  );
};
