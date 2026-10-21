'use client';

import React from 'react';
import { X, ExternalLink, Receipt } from 'lucide-react';

interface Props {
  url: string | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<Props> = ({ url, onClose }) => {
  if (!url) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Attached Expense Receipt / Proof
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center max-h-[380px]">
          <img
            src={url}
            alt="Expense receipt proof"
            className="max-h-[380px] w-auto object-contain rounded-xl"
          />
        </div>

        <div className="flex items-center justify-between pt-2 text-xs">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open full resolution image
          </a>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
