import { Loan, Summary } from '../types';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3999';

export const api = {
  async sendOtp(phone: string): Promise<{ success: boolean; otp?: string; message: string }> {
    const res = await fetch(`${API_BASE}/api/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    return res.json();
  },

  async verifyOtp(phone: string, otp: string): Promise<{ success: boolean; token?: string; error?: string }> {
    const res = await fetch(`${API_BASE}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    });
    return res.json();
  },

  async getSummary(phone: string): Promise<Summary> {
    const res = await fetch(`${API_BASE}/api/summary?phone=${encodeURIComponent(phone)}`);
    const data = await res.json();
    return data.summary;
  },

  async getLoans(phone: string, filter: string = 'all'): Promise<Loan[]> {
    const res = await fetch(`${API_BASE}/api/loans?phone=${encodeURIComponent(phone)}&filter=${filter}`);
    const data = await res.json();
    return data.loans || [];
  },

  async createLoan(phone: string, payload: {
    friend_name: string;
    amount: number;
    due_date: string;
    notes?: string;
    receipt_url?: string;
  }): Promise<Loan> {
    const res = await fetch(`${API_BASE}/api/loans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-phone': phone,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create loan');
    return data.loan;
  },

  async markRepaid(id: string, is_repaid: boolean = true): Promise<Loan> {
    const res = await fetch(`${API_BASE}/api/loans/${id}/repay`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_repaid }),
    });
    const data = await res.json();
    return data.loan;
  },
};
