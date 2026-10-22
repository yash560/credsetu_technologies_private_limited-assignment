'use client';

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { tactile } from '@/lib/tactileFeedback';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  friendName: string;
  amount: number;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  friendName,
  amount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 shadow-2xl p-6 space-y-5">
        {/* Header with Warning Icon */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Delete Loan Entry?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              tactile.subtle();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#121927] border border-slate-200/60 dark:border-white/5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Borrower</span>
            <span className="font-bold text-slate-900 dark:text-white">{friendName}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Outstanding Balance</span>
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
              ₹{amount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Removing this entry will recalculate your recovery pace, active balance, and overdue counts.
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              tactile.subtle();
              onClose();
            }}
            className="h-11 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all active:scale-98"
          >
            Keep Entry
          </button>
          <button
            type="button"
            onClick={() => {
              tactile.warning();
              onConfirm();
              onClose();
            }}
            className="h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-98 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Debt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
