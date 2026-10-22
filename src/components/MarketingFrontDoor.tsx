'use client';

import React, { useState } from 'react';
import {
  Wallet,
  ShieldCheck,
  Send,
  Receipt,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Sun,
  Moon,
  MessageSquare,
  Clock,
  HeartHandshake,
} from 'lucide-react';
import { tactile } from '@/lib/tactileFeedback';
import { AuthModalTab } from '@/types';

interface MarketingFrontDoorProps {
  onOpenAuth: (tab: AuthModalTab) => void;
  isDark: boolean;
  toggleDark: () => void;
}

export const MarketingFrontDoor: React.FC<MarketingFrontDoorProps> = ({
  onOpenAuth,
  isDark,
  toggleDark,
}) => {
  // Interactive Calculator Sandbox state
  const [demoAmount, setDemoAmount] = useState<number>(3500);
  const [demoCategory, setDemoCategory] = useState<'dining' | 'trips' | 'rent' | 'cash'>('dining');
  const [demoTone, setDemoTone] = useState<'gentle' | 'friendly' | 'direct'>('friendly');

  const getDemoMessage = () => {
    const formatted = `₹${demoAmount.toLocaleString('en-IN')}`;
    const purpose =
      demoCategory === 'dining'
        ? 'dinner and drinks bill'
        : demoCategory === 'trips'
        ? 'weekend trip Airbnb share'
        : demoCategory === 'rent'
        ? 'apartment rent split'
        : 'emergency cash advance';

    switch (demoTone) {
      case 'gentle':
        return `Hey! Hope you're having a good week. Whenever you get a chance, could you check the ${formatted} for our ${purpose}? No rush at all, just balancing the ledger. Thank you!`;
      case 'direct':
        return `Hi! Gentle heads-up that ${formatted} for our ${purpose} was scheduled for repayment. Whenever you can, please settle up via UPI. Appreciate it!`;
      case 'friendly':
      default:
        return `Hey! Quick nudge regarding the ${formatted} for our ${purpose}. Whenever you get a minute, please settle up. Thanks a ton!`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d16] text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* 1. Public Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#080d16]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-extrabold flex items-center justify-center shadow-md shadow-emerald-600/30 touch-icon">
            ✦
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white block leading-none">
              MiniLedger
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
              Peer Lending Engine
            </span>
          </div>
        </div>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Features
          </a>
          <a href="#calculator" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Interactive Demo
          </a>
          <a href="#reminders" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Polite Reminders
          </a>
          <a href="#security" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Privacy &amp; Auth
          </a>
        </nav>

        {/* Right CTA Group */}
        <div className="flex items-center gap-2.5">
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDark}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors touch-icon"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Sign In Button */}
          <button
            type="button"
            onClick={() => {
              tactile.tap();
              onOpenAuth('signin');
            }}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Sign In
          </button>

          {/* Primary CTA */}
          <button
            type="button"
            onClick={() => {
              tactile.success();
              onOpenAuth('signup');
            }}
            className="tactile-btn px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-12">
        {/* Ambient Blur Radiance */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/20 via-teal-400/15 to-transparent blur-3xl rounded-full" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold tracking-wide shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 icon-live-beacon" />
            <span>NO MORE SOCIAL AWKWARDNESS • PURE FINANCIAL CLARITY</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Stop the Awkwardness.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400">
              Track Money Lent to Friends
            </span>{' '}
            with Polite Numbers.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Keep friendly loans, weekend trip splits, and shared bills crystal clear. Eliminate confrontation with
            courteous automated WhatsApp and email reminders, and Cloudinary bill proofs.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => {
                tactile.success();
                onOpenAuth('signup');
              }}
              className="tactile-btn w-full sm:w-auto px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-extrabold shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2"
            >
              <span>Create Free Account →</span>
            </button>

            <button
              type="button"
              onClick={() => {
                tactile.tap();
                onOpenAuth('signin');
              }}
              className="tactile-btn w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-xs"
            >
              <span>⚡ Live Demo / Quick Sign In</span>
            </button>
          </div>

          {/* Micro Trust Pills */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Free Peer Ledger
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Real SMTP Password Recovery
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zero Awkward Phone Calls
            </span>
          </div>
        </div>
      </section>

      {/* 3. Interactive Sandbox Demo Calculator */}
      <section id="calculator" className="py-12 bg-slate-100/60 dark:bg-[#0c121e]/60 border-y border-slate-200/80 dark:border-white/5 px-4 sm:px-6 lg:px-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">
              Interactive Sandbox Preview
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Experience the Anti-Awkwardness Reminders Live
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Test how MiniLedger converts pending debts into courteous, dispute-free messages before you even sign in.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Control Pane */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-white/10 shadow-xs space-y-5 tactile-card">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between mb-2">
                  <span>Loan Amount</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm font-black">
                    ₹{demoAmount.toLocaleString('en-IN')}
                  </span>
                </label>
                <input
                  type="range"
                  min="500"
                  max="25000"
                  step="500"
                  value={demoAmount}
                  onChange={(e) => {
                    tactile.subtle();
                    setDemoAmount(Number(e.target.value));
                  }}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Expense Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'dining', label: '🍔 Dining & Drinks' },
                    { id: 'trips', label: '🚗 Weekend Trips' },
                    { id: 'rent', label: '🏠 Rent & Bills' },
                    { id: 'cash', label: '⚡ Emergency Cash' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        tactile.tap();
                        setDemoCategory(cat.id as typeof demoCategory);
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                        demoCategory === cat.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Polite Reminder Tone
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'gentle', label: '🌱 Gentle' },
                    { id: 'friendly', label: '🤝 Friendly' },
                    { id: 'direct', label: '⚡ Direct' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        tactile.tap();
                        setDemoTone(t.id as typeof demoTone);
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                        demoTone === t.id
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Message Preview Pane */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#121927] border border-slate-200 dark:border-white/10 shadow-xs flex flex-col justify-between space-y-4 tactile-card">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <MessageSquare className="w-4 h-4 text-[#25D366]" />
                    <span>WhatsApp Click-to-Chat &amp; SMTP Preview</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                    Zero Social Friction
                  </span>
                </div>

                <div className="mt-4 p-5 rounded-2xl bg-emerald-50/60 dark:bg-[#0c1815] border border-emerald-200/80 dark:border-emerald-800/40 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                  “{getDemoMessage()}”
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-white/5">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Ready to balance your real ledgers?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    tactile.success();
                    onOpenAuth('signup');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Launch My Ledger Cockpit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Feature Bento Grid */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">
            Engineered for Real Relationships
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Everything You Need to Keep Friendships Healthy
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Clear records, attached bill proofs, and polite settlement nudges keep your finances organized without friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Polite Reminders */}
          <div className="p-7 rounded-3xl bg-white dark:bg-[#0f1624] border border-slate-200 dark:border-white/10 shadow-xs space-y-4 tactile-card">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold touch-icon">
              <Send className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Polite WhatsApp &amp; SMTP Nudges
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              No more awkward phone calls. Send gentle WhatsApp reminders with direct settlement links and formatted INR currency with a single click.
            </p>
          </div>

          {/* Card 2: Cloudinary Proof Vault */}
          <div className="p-7 rounded-3xl bg-white dark:bg-[#0f1624] border border-slate-200 dark:border-white/10 shadow-xs space-y-4 tactile-card">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold touch-icon">
              <Receipt className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Cloudinary Bill Proof Vault
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Attach restaurant receipts, flight tickets, or payment proofs directly to transactions. High-resolution lightbox verification eliminates disputes.
            </p>
          </div>

          {/* Card 3: Overdue Diagnostics */}
          <div className="p-7 rounded-3xl bg-white dark:bg-[#0f1624] border border-slate-200 dark:border-white/10 shadow-xs space-y-4 tactile-card">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold touch-icon">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Repayment Schedule &amp; Diagnostics
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Categorize debts into Overdue, Due This Week, and Upcoming. Visual countdown pills ensure both lender and friend stay aligned on schedule.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Security & Privacy Guarantee Section */}
      <section id="security" className="py-12 bg-slate-900 text-white px-4 sm:px-6 lg:px-12 border-t border-slate-800">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>Strict Auth Wall &amp; Zero Data Leaks</span>
            </div>
            <h3 className="text-2xl font-bold text-white">Your Debts &amp; Balances Stay 100% Private</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Personal loan entries, friend directories, and financial statements are strictly locked behind bcrypt
              passwords and secure HTTP-only cookies. No unauthenticated visitor can ever view your records.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              tactile.success();
              onOpenAuth('signin');
            }}
            className="tactile-btn px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shrink-0 shadow-lg"
          >
            Sign In with Security →
          </button>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="mt-auto py-8 bg-white dark:bg-[#060910] border-t border-slate-200 dark:border-white/5 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 dark:text-white">MiniLedger</span>
            <span>• Peer debt tracking & polite repayment reminders</span>
          </div>
          <div className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} Credsetu Technologies Private Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
