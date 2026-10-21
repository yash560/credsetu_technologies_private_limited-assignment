'use client';

import React, { useState, useEffect } from 'react';
import { Terminal, Copy, Check, X, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { ServerLogEntry } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAutofillOtp?: (otp: string) => void;
}

export const ServerLogDrawer: React.FC<Props> = ({ isOpen, onClose, onAutofillOtp }) => {
  const [logs, setLogs] = useState<ServerLogEntry[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error('Failed to load server logs:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
      const interval = setInterval(fetchLogs, 2500);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-slate-950 border-t border-slate-800 shadow-2xl transition-all duration-300 max-h-[420px] flex flex-col font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200">
            Node.js stdout / Backend Server Console (Mock OTP Stream)
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
            Live stdout
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
            title="Refresh logs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs Feed */}
      <div className="p-4 overflow-y-auto space-y-2 text-xs flex-1">
        {logs.length === 0 ? (
          <div className="text-slate-500 py-6 text-center italic">
            Waiting for backend events... Request an OTP or add a loan to see server stdout output.
          </div>
        ) : (
          logs.map((log) => {
            const isOtp = log.level === 'otp' || log.otp;
            return (
              <div
                key={log.id}
                className={`p-2.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  isOtp
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : log.level === 'warn'
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                    : log.level === 'success'
                    ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-start gap-2 flex-1">
                  <span className="text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <div>
                    <span className="font-semibold">{log.message}</span>
                    {log.phone && (
                      <span className="text-[11px] opacity-75 block text-slate-400">
                        Target Phone: {log.phone}
                      </span>
                    )}
                  </div>
                </div>

                {log.otp && (
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-base font-black tracking-widest text-emerald-400 bg-slate-900 px-2.5 py-1 rounded border border-emerald-500/50">
                      {log.otp}
                    </span>
                    <button
                      onClick={() => copyToClipboard(log.otp!, log.id)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Copy OTP to clipboard"
                    >
                      {copiedId === log.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {onAutofillOtp && (
                      <button
                        onClick={() => onAutofillOtp(log.otp!)}
                        className="px-2 py-1 rounded text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        Autofill
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>Assignment Invariant: Mock OTP printed to server log instead of live SMS gateway</span>
        <span>Node.js v20 • Express/Next API • PostgreSQL</span>
      </div>
    </div>
  );
};
