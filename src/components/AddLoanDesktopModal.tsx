'use client';

import React, { useState } from 'react';
import { X, Plus, Calendar, IndianRupee, User, FileText, Image as ImageIcon } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    friend_name: string;
    amount: number;
    due_date: string;
    notes?: string;
    receipt_url?: string;
  }) => Promise<void>;
}

export const AddLoanDesktopModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [friendName, setFriendName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!friendName.trim() || friendName.trim().length < 2) {
      errs.friendName = 'Friend name is required (at least 2 characters)';
    }
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      errs.amount = 'Please enter a valid loan amount greater than 0';
    }
    if (!dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      errs.dueDate = 'Due date must follow YYYY-MM-DD format';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        friend_name: friendName.trim(),
        amount: parseFloat(amount),
        due_date: dueDate,
        notes: notes.trim() || undefined,
        receipt_url: receiptUrl.trim() || undefined,
      });
      setFriendName('');
      setAmount('');
      setNotes('');
      setReceiptUrl('');
      setErrors({});
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              +
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Record Money Lent to Friend
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Friend's Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="desktop-input-friend-name"
                type="text"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                placeholder="e.g. Rahul Verma"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>
            {errors.friendName && (
              <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.friendName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Amount (₹) *
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="desktop-input-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5000"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>
              {errors.amount && (
                <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Due Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="desktop-input-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>
              {errors.dueDate && (
                <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.dueDate}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Purpose / Notes (Optional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <textarea
                id="desktop-input-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Dinner split, concert tickets, trip Airbnb, emergency loan..."
                rows={2}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-medium resize-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Receipt Photo URL (Bonus)
              </label>
              <button
                type="button"
                onClick={() =>
                  setReceiptUrl(
                    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'
                  )
                }
                className="text-[11px] text-indigo-500 font-bold hover:underline"
              >
                + Attach Sample Receipt
              </button>
            </div>
            <div className="relative">
              <ImageIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="desktop-input-receipt"
                type="text"
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or paste image URL"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
            >
              Cancel
            </button>
            <button
              id="desktop-submit-loan-btn"
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Add to Ledger'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
