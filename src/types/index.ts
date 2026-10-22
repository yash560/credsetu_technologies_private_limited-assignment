export interface UserAccount {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  avatar_url?: string | null;
  is_email_verified: boolean;
  role: 'USER' | 'ADMIN';
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  phone?: string | null;
  token: string;
  loggedInAt: string;
}

export interface LoanEntry {
  id: string;
  user_id?: string;
  phone: string;
  friend_name: string;
  amount: number;
  due_date: string; // YYYY-MM-DD
  is_repaid: boolean;
  repaid_at?: string | null;
  notes?: string | null;
  receipt_url?: string | null;
  category?: 'dining' | 'trips' | 'rent' | 'cash' | 'general';
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

export interface ServerLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'otp' | 'email' | 'success' | 'auth';
  message: string;
  email?: string;
  phone?: string;
  otp?: string;
  metadata?: Record<string, unknown>;
}

export type LoanFilter = 'all' | 'overdue' | 'active' | 'repaid';
export type ActiveTab = 'dashboard' | 'friends' | 'schedule' | 'receipts' | 'analytics' | 'spaces';
export type AuthModalTab = 'signin' | 'signup' | 'forgot' | 'reset' | 'settings';
