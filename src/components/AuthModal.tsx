'use client';

import React, { useState } from 'react';
import { Smartphone, KeyRound, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, X, Terminal } from 'lucide-react';
import { tactile } from '@/lib/tactileFeedback';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhone: string;
  onLoginSuccess: (phone: string) => void;
  onOpenLogs?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentPhone,
  onLoginSuccess,
  onOpenLogs,
}) => {
  const [phone, setPhone] = useState(currentPhone);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sentOtpHint, setSentOtpHint] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanPhone = phone.trim();

    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      tactile.warning();
      return;
    }

    setLoading(true);
    tactile.subtle();

    try {
      const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`;
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      setPhone(formattedPhone);
      setSentOtpHint(data.otp);
      setStep('otp');
      tactile.tap();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error sending OTP');
      tactile.warning();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otp.trim() || otp.trim().length < 4) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      tactile.warning();
      return;
    }

    setLoading(true);
    tactile.subtle();

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid OTP code. Please check server logs.');
      }

      tactile.success();
      onLoginSuccess(phone);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed');
      tactile.warning();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-7 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {step === 'phone' ? 'MiniLedger Account Sign-In' : 'Enter Verification Code'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === 'phone'
                  ? 'Access your personal ledger and track debts'
                  : `Sent to ${phone}`}
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

        {/* Step 1: Phone Input */}
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Mobile Number
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-[#121927] border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  autoFocus
                />
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block animate-spin">⏳</span>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: OTP Verification */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Verification Code (OTP)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    tactile.subtle();
                    setStep('phone');
                    setOtp('');
                  }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                >
                  Change Number
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-[#121927] border border-slate-200 dark:border-white/10 text-sm font-mono font-bold tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Mock OTP Helper Pill */}
            {sentOtpHint && (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-amber-900 dark:text-amber-200">
                    Mock OTP: <span className="font-mono text-sm underline">{sentOtpHint}</span>
                  </p>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                    Auto-printed to server stdout &amp; drawer
                  </p>
                </div>
                {onOpenLogs && (
                  <button
                    type="button"
                    onClick={() => {
                      tactile.tap();
                      onOpenLogs();
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100 font-bold text-[10px] hover:bg-amber-300 transition-colors shrink-0"
                  >
                    <Terminal className="w-3 h-3" />
                    <span>View Logs</span>
                  </button>
                )}
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block animate-spin">⏳</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify &amp; Sign In</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Sovereign Zero-Knowledge Session Authentication</span>
        </div>
      </div>
    </div>
  );
};
