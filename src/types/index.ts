export interface LoanEntry {
  id: string;
  phone: string;
  friend_name: string;
  amount: number;
  due_date: string; // YYYY-MM-DD
  is_repaid: boolean;
  repaid_at?: string | null;
  notes?: string | null;
  receipt_url?: string | null;
  created_at: string;
  updated_at: string;
  is_overdue?: boolean;
  days_overdue?: number;
}

export interface LoanSummary {
  total_lent: number;
  total_repaid: number;
  overdue_amount: number;
  active_amount: number;
  total_loans: number;
  overdue_count: number;
  active_count: number;
  repaid_count: number;
  repayment_rate_pct: number;
}

export interface UserSession {
  phone: string;
  name: string;
  token: string;
  loggedInAt: string;
}

export interface ServerLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'otp' | 'success';
  message: string;
  phone?: string;
  otp?: string;
}

export type LoanFilter = 'all' | 'overdue' | 'active' | 'repaid';
