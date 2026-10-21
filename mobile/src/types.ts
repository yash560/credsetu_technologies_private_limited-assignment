export interface Loan {
  id: string;
  phone: string;
  friend_name: string;
  amount: number;
  due_date: string;
  is_repaid: boolean;
  repaid_at?: string | null;
  notes?: string | null;
  receipt_url?: string | null;
  is_overdue?: boolean;
  days_overdue?: number;
}

export interface Summary {
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
