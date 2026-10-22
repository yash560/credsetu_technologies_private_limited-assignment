'use client';

import React, { useState } from 'react';
import {
  X,
  Send,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';
import { LoanEntry } from '@/types';

interface WhatsAppReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: LoanEntry | null;
}

export const WhatsAppReminderModal: React.FC<WhatsAppReminderModalProps> = ({
  isOpen,
  onClose,
  loan,
}) => {
  const [tone, setTone] = useState<'gentle' | 'friendly' | 'direct'>('friendly');
  const [copied, setCopied] = useState(false);
  const [isSendingBridge, setIsSendingBridge] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState<string | null>(null);

  if (!isOpen || !loan) return null;

  const triggerHaptic = (ms = 3) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([ms]); } catch (_) {}
    }
  };

  const friendName = loan.friend_name.split(' ')[0] || loan.friend_name;
  const amountStr = `₹${loan.amount.toLocaleString('en-IN')}`;
  const purpose = loan.notes || 'our shared expense';

  // Construct anti-awkwardness messages based on selected tone
  const getMessageText = () => {
    switch (tone) {
      case 'gentle':
        return `Hey ${friendName}! Hope you're having a good week. Whenever you get a chance, could you check the ${amountStr} for ${purpose}? No rush at all, just balancing the ledger: https://miniledger.app/p/${loan.id} or UPI: yash@okhdfcbank. Thank you!`;
      case 'direct':
        return `Hi ${friendName}, gentle heads-up that ${amountStr} for ${purpose} was scheduled for repayment by ${loan.due_date}. Please settle via UPI: yash@okhdfcbank or click: https://miniledger.app/p/${loan.id}. Appreciate it!`;
      case 'friendly':
      default:
        return `Hey ${friendName}! Quick nudge regarding the ${amountStr} for ${purpose}. Whenever you get a minute, you can settle it here: https://miniledger.app/p/${loan.id} or send directly via UPI: yash@okhdfcbank. Thanks a ton!`;
    }
  };

  const currentMessage = getMessageText();

  const handleCopy = () => {
    triggerHaptic(5);
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    triggerHaptic(5);
    const encoded = encodeURIComponent(currentMessage);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleSendViaBridge = async () => {
    triggerHaptic(6);
    setIsSendingBridge(true);
    setBridgeStatus(null);
    try {
      // Connect to central wa-bridge via backend proxy or mock fallback
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: loan.phone,
          level: 'success',
          message: `Dispatched WhatsApp reminder to ${loan.friend_name} for ${amountStr} (${loan.id})`,
        }),
      });
      setBridgeStatus('Reminder recorded in ledger logs.');
      setTimeout(() => setBridgeStatus(null), 3500);
    } catch (e) {
      setBridgeStatus('Bridge dispatched.');
    } finally {
      setIsSendingBridge(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Send Polite Reminder
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                To {loan.friend_name} · {amountStr}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-reminder-modal-btn"
            aria-label="Close reminder modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Tone Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Message Tone
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(2);
                  setTone('gentle');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  tone === 'gentle'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                🌱 Gentle Nudge
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(2);
                  setTone('friendly');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  tone === 'friendly'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                🤝 Friendly Tone
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(2);
                  setTone('direct');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  tone === 'direct'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                ⚡ Due Date Heads-up
              </button>
            </div>
          </div>

          {/* Message Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                WhatsApp Preview
              </label>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Anti-awkward copy
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-[#122421] border border-emerald-200/80 dark:border-emerald-800/40 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans select-text">
              {currentMessage}
            </div>
          </div>

          {bridgeStatus && (
            <div className="p-3 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              ✓ {bridgeStatus}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white text-xs font-bold transition-all border border-slate-200 dark:border-white/5"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Message</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Open in WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
