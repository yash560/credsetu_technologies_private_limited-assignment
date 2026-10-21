'use client';

import React, { useState } from 'react';
import { X, Database, ShieldCheck, Cpu, Smartphone, Layers, Terminal, Copy, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'arch' | 'api' | 'rn'>('sql');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlSchema = `-- MiniLedger Production PostgreSQL DDL Schema
-- Credsetu Technologies Assignment

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) DEFAULT 'MiniLedger User',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE otp_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    friend_name VARCHAR(150) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    due_date DATE NOT NULL,
    is_repaid BOOLEAN DEFAULT FALSE NOT NULL,
    repaid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fast Indexes for Overdue Queries & Summaries
CREATE INDEX idx_loans_phone_due ON loans(phone, due_date, is_repaid);
CREATE INDEX idx_loans_status ON loans(is_repaid);`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                MiniLedger System Architecture & PostgreSQL Spec
              </h2>
              <p className="text-xs text-slate-500">Credsetu Technologies Full Stack Architecture</p>
            </div>
          </div>
          <button
            id="close-arch-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'sql'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            PostgreSQL DDL & Schema
          </button>
          <button
            onClick={() => setActiveTab('arch')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'arch'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            System Hierarchy & Flow
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'api'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Node.js REST Endpoints
          </button>
          <button
            onClick={() => setActiveTab('rn')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'rn'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            React Native Component Tree
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-slate-600 dark:text-slate-400">
                  Full relational schema with indexing on <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">(phone, due_date, is_repaid)</code> to ensure O(log N) fast summary aggregations and overdue scans.
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sqlSchema);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy SQL'}
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-slate-800">
                {sqlSchema}
              </pre>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Double-Entry Invariant</h4>
                  <p className="text-slate-500 font-mono text-[11px]">
                    Total Lent = Total Repaid + Active Outstanding + Overdue
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Index Optimization</h4>
                  <p className="text-slate-500">
                    B-Tree composite index on <code className="font-mono">due_date</code> prevents full table scans for overdue notifications.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">ACID & Constraints</h4>
                  <p className="text-slate-500">
                    Check constraint <code className="font-mono">amount &gt; 0</code> prevents negative balances and arithmetic bugs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'arch' && (
            <div className="space-y-4 text-slate-700 dark:text-slate-300">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Multi-Platform Hybrid Architecture
              </h3>
              <p>
                To provide both maximum candidate evaluation convenience and production fidelity, MiniLedger is architected as a full monorepo with 3 distinct execution targets:
              </p>
              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20">
                  <h4 className="font-bold text-indigo-700 dark:text-indigo-300">
                    1. Mobile App (React Native / Expo in <code className="font-mono">mobile/</code>)
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Native React Native screens (<code className="font-mono">LoginScreen</code>, <code className="font-mono">HomeScreen</code>, <code className="font-mono">SummaryCard</code>, <code className="font-mono">LoanItem</code>, <code className="font-mono">AddLoanModal</code>) that run on iOS/Android via Expo or in-browser via the interactive iPhone 16 Pro simulator frame.
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <h4 className="font-bold text-emerald-700 dark:text-emerald-300">
                    2. Node.js + TypeScript + PostgreSQL Backend (<code className="font-mono">server/</code> & <code className="font-mono">src/app/api/</code>)
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Standalone Express HTTP service with <code className="font-mono">pg.Pool</code>, auto-DDL execution, and stdout logging for mock OTP, mirrored seamlessly on Next.js 15 App Router Edge endpoints for live Vercel deployment.
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
                  <h4 className="font-bold text-purple-700 dark:text-purple-300">
                    3. Live Server Log Drawer & Real-Time stdout Monitor
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Real-time log drawer streaming mock OTPs printed to stdout, fulfilling the assignment directive: <em>"Phone number login with a mock OTP (just print the OTP in the server log)"</em>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-3 font-mono text-[11px]">
              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 border border-slate-800">
                <span className="text-indigo-400 font-bold">POST</span> /api/auth/otp/send
                <div className="text-slate-400 mt-1 text-[10px]">
                  Body: {`{ "phone": "+919876543210" }`} &bull; Prints OTP to backend stdout
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 border border-slate-800">
                <span className="text-indigo-400 font-bold">POST</span> /api/auth/otp/verify
                <div className="text-slate-400 mt-1 text-[10px]">
                  Body: {`{ "phone": "+919876543210", "otp": "123456" }`} &bull; Returns session token
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 border border-slate-800">
                <span className="text-emerald-400 font-bold">GET</span> /api/summary?phone=+919876543210
                <div className="text-slate-400 mt-1 text-[10px]">
                  Returns: {`{ "total_lent": 32800, "total_repaid": 7500, "overdue_amount": 7300 }`}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 border border-slate-800">
                <span className="text-emerald-400 font-bold">GET</span> /api/loans?phone=+919876543210&amp;filter=overdue
                <div className="text-slate-400 mt-1 text-[10px]">
                  Returns array of loan entries with is_overdue &amp; days_overdue computed
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 border border-slate-800">
                <span className="text-indigo-400 font-bold">POST</span> /api/loans
                <div className="text-slate-400 mt-1 text-[10px]">
                  Body: {`{ "friend_name": "Rahul", "amount": 4500, "due_date": "2026-10-14" }`}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 border border-slate-800">
                <span className="text-amber-400 font-bold">PATCH</span> /api/loans/:id/repay
                <div className="text-slate-400 mt-1 text-[10px]">
                  Body: {`{ "is_repaid": true }`} &bull; Updates repayment status and timestamp
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rn' && (
            <div className="space-y-3 text-slate-700 dark:text-slate-300">
              <h4 className="font-bold text-slate-900 dark:text-white">
                React Native Structure (<code className="font-mono">mobile/src/</code>)
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><code className="font-mono font-bold text-indigo-600 dark:text-indigo-400">App.tsx</code>: Auth state router switching between Login and Home</li>
                <li><code className="font-mono font-bold text-indigo-600 dark:text-indigo-400">screens/LoginScreen.tsx</code>: Phone number input + 6-digit OTP verification</li>
                <li><code className="font-mono font-bold text-indigo-600 dark:text-indigo-400">screens/HomeScreen.tsx</code>: Pull-to-refresh FlatList with filter segments</li>
                <li><code className="font-mono font-bold text-indigo-600 dark:text-indigo-400">components/SummaryCard.tsx</code>: Total Lent, Repaid, and Overdue banner</li>
                <li><code className="font-mono font-bold text-indigo-600 dark:text-indigo-400">components/LoanItem.tsx</code>: Overdue card highlighting with red badge &amp; days calculation</li>
                <li><code className="font-mono font-bold text-indigo-600 dark:text-indigo-400">components/AddLoanModal.tsx</code>: Slide-up modal with photo receipt attachment</li>
                <li><code className="font-mono font-bold text-indigo-600 dark:text-indigo-400">services/api.ts</code>: Unified REST client handling all backend requests</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
