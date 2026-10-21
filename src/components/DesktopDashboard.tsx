'use client';

import React, { useState } from 'react';
import {
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  UserCheck,
  TrendingUp,
} from 'lucide-react';
import { LoanEntry, LoanSummary, LoanFilter } from '@/types';

interface Props {
  loans: LoanEntry[];
  summary: LoanSummary | null;
  filter: LoanFilter;
  setFilter: (f: LoanFilter) => void;
  activePhone: string;
  onRefresh: () => void;
  onToggleRepay: (id: string, current: boolean) => Promise<void>;
  onDeleteLoan: (id: string) => Promise<void>;
  onOpenAddModal: () => void;
  onViewReceipt: (url: string) => void;
}

export const DesktopDashboard: React.FC<Props> = ({
  loans,
  summary,
  filter,
  setFilter,
  activePhone,
  onRefresh,
  onToggleRepay,
  onDeleteLoan,
  onOpenAddModal,
  onViewReceipt,
}) => {
  const [search, setSearch] = useState('');

  const filteredLoans = loans.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.friend_name.toLowerCase().includes(q) ||
      (l.notes && l.notes.toLowerCase().includes(q)) ||
      l.amount.toString().includes(q)
    );
  });

  const exportCsv = () => {
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
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `miniledger_${activePhone}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Lent */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Lent</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            ₹{(summary?.total_lent || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 mt-1">Across {summary?.total_loans || 0} loan entries</p>
        </div>

        {/* Total Repaid */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Repaid</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            ₹{(summary?.total_repaid || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {summary?.repayment_rate_pct || 0}% recovery rate ({summary?.repaid_count || 0} settled)
          </p>
        </div>

        {/* Overdue Amount */}
        <div className="p-5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-bold uppercase tracking-wider">Overdue Amount</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            ₹{(summary?.overdue_amount || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1 font-semibold">
            ⚠️ {summary?.overdue_count || 0} friends past repayment deadline
          </p>
        </div>

        {/* Active Outstanding */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Pending</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            ₹{(summary?.active_amount || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {summary?.active_count || 0} active loans within deadline
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search friend name, amount, or notes..."
            className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : tab === 'overdue' && count > 0
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {count > 0 ? ` (${count})` : ''}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            title="Export Ledger to CSV"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Loan Entry
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Friend</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes & Receipt</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No loan entries matching filter criteria
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => {
                  const isOverdue = loan.is_overdue;
                  const isRepaid = loan.is_repaid;

                  return (
                    <tr
                      key={loan.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isOverdue && !isRepaid ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center text-xs ${
                              isOverdue && !isRepaid
                                ? 'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-200'
                                : isRepaid
                                ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200'
                                : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                            }`}
                          >
                            {loan.friend_name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {loan.friend_name}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`font-black text-sm ${
                            isOverdue && !isRepaid
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          ₹{loan.amount.toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {loan.due_date}
                          </span>
                          {isOverdue && !isRepaid && (
                            <span className="block text-[10px] font-bold text-rose-600 dark:text-rose-400">
                              ⚠️ {loan.days_overdue} days overdue
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {isRepaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Repaid
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            OVERDUE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            <Clock className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        {loan.notes && (
                          <p className="truncate text-slate-600 dark:text-slate-400">
                            {loan.notes}
                          </p>
                        )}
                        {loan.receipt_url && (
                          <button
                            onClick={() => onViewReceipt(loan.receipt_url!)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline mt-0.5"
                          >
                            <Receipt className="w-3 h-3" />
                            View Attached Receipt
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onToggleRepay(loan.id, isRepaid)}
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              isRepaid
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                            }`}
                          >
                            {isRepaid ? 'Unmark' : '✓ Mark Repaid'}
                          </button>
                          <button
                            onClick={() => onDeleteLoan(loan.id)}
                            title="Delete entry"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
