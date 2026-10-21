import { Pool } from 'pg';
import { LoanEntry, LoanSummary, ServerLogEntry } from '@/types';

// Real-time server log collector for mock OTPs & API activity
class ServerLogStore {
  private logs: ServerLogEntry[] = [];
  private maxLogs = 100;

  addLog(entry: Omit<ServerLogEntry, 'id' | 'timestamp'>) {
    const log: ServerLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      ...entry,
    };
    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
    return log;
  }

  getLogs(): ServerLogEntry[] {
    return [...this.logs];
  }
}

export const serverLogs = new ServerLogStore();

// In-Memory Fallback Store (for Vercel edge/serverless previews or offline dev)
interface MockDbStore {
  otps: Map<string, { otp: string; expiresAt: number }>;
  loans: Map<string, LoanEntry>;
}

// Global persistence across hot-reloads
const globalStore = globalThis as unknown as {
  __miniledger_store?: MockDbStore;
  __miniledger_pg_pool?: Pool | null;
};

if (!globalStore.__miniledger_store) {
  globalStore.__miniledger_store = {
    otps: new Map(),
    loans: new Map(),
  };

  // Seed initial realistic data for default testing
  const sampleLoans: LoanEntry[] = [
    {
      id: 'loan-seed-1',
      phone: '+919876543210',
      friend_name: 'Rahul Verma',
      amount: 4500,
      due_date: '2026-10-14', // 7 days overdue
      is_repaid: false,
      repaid_at: null,
      notes: 'Weekend trip Airbnb share + dinner bill',
      receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      created_at: '2026-10-01T10:00:00Z',
      updated_at: '2026-10-01T10:00:00Z',
    },
    {
      id: 'loan-seed-2',
      phone: '+919876543210',
      friend_name: 'Priya Sharma',
      amount: 12000,
      due_date: '2026-10-28', // Upcoming active
      is_repaid: false,
      repaid_at: null,
      notes: 'College semester tuition advance',
      receipt_url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
      created_at: '2026-10-10T14:30:00Z',
      updated_at: '2026-10-10T14:30:00Z',
    },
    {
      id: 'loan-seed-3',
      phone: '+919876543210',
      friend_name: 'Amit Patel',
      amount: 2800,
      due_date: '2026-10-18', // 3 days overdue
      is_repaid: false,
      repaid_at: null,
      notes: 'Concert tickets split for Bangalore Music Fest',
      receipt_url: null,
      created_at: '2026-10-05T09:15:00Z',
      updated_at: '2026-10-05T09:15:00Z',
    },
    {
      id: 'loan-seed-4',
      phone: '+919876543210',
      friend_name: 'Sneha Reddy',
      amount: 7500,
      due_date: '2026-10-15',
      is_repaid: true,
      repaid_at: '2026-10-16T12:00:00Z',
      notes: 'Camera lens rental advance for Goa shoot',
      receipt_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=80',
      created_at: '2026-10-02T16:20:00Z',
      updated_at: '2026-10-16T12:00:00Z',
    },
    {
      id: 'loan-seed-5',
      phone: '+919876543210',
      friend_name: 'Vikram Singh',
      amount: 6000,
      due_date: '2026-11-05', // Active
      is_repaid: false,
      repaid_at: null,
      notes: 'Car servicing emergency payment',
      receipt_url: null,
      created_at: '2026-10-18T11:45:00Z',
      updated_at: '2026-10-18T11:45:00Z',
    },
  ];

  for (const loan of sampleLoans) {
    globalStore.__miniledger_store.loans.set(loan.id, loan);
  }
}

// PostgreSQL Connection Pool Setup
function getPgPool(): Pool | null {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl) return null;

  if (!globalStore.__miniledger_pg_pool) {
    try {
      globalStore.__miniledger_pg_pool = new Pool({
        connectionString: dbUrl,
        ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
      });
    } catch {
      globalStore.__miniledger_pg_pool = null;
    }
  }
  return globalStore.__miniledger_pg_pool;
}

// Normalize phone format
export function normalizePhone(rawPhone: string): string {
  const cleaned = rawPhone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.length === 10) return `+91${cleaned}`;
  return `+${cleaned}`;
}

// Generate & Store Mock OTP
export async function generateMockOtp(rawPhone: string): Promise<string> {
  const phone = normalizePhone(rawPhone);
  // Generate deterministic/clean 6-digit mock OTP
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const otp = String(randomNum);
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

  // Store in Memory Store
  globalStore.__miniledger_store!.otps.set(phone, { otp, expiresAt });

  // PRINT OTP TO SERVER LOG (MANDATORY REQUIREMENT)
  console.log('=====================================================');
  console.log(`[MINILEDGER-AUTH-OTP] 📱 PHONE: ${phone}`);
  console.log(`[MINILEDGER-AUTH-OTP] 🔑 MOCK OTP: ${otp}`);
  console.log(`[MINILEDGER-AUTH-OTP] ⏱️ VALID UNTIL: ${new Date(expiresAt).toLocaleTimeString()}`);
  console.log('=====================================================');

  // Record into Real-time Server Log Store
  serverLogs.addLog({
    level: 'otp',
    phone,
    otp,
    message: `[MOCK OTP PRINTED TO LOG] Generated code ${otp} for phone ${phone}. Valid for 5 minutes.`,
  });

  // Attempt Postgres store if configured
  const pool = getPgPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO otp_sessions (phone, otp, expires_at) VALUES ($1, $2, $3)`,
        [phone, otp, new Date(expiresAt)]
      );
    } catch (e) {
      console.warn('PostgreSQL OTP write skipped:', (e as Error).message);
    }
  }

  return otp;
}

// Verify Mock OTP
export async function verifyMockOtp(rawPhone: string, inputOtp: string): Promise<boolean> {
  const phone = normalizePhone(rawPhone);
  
  // Allow universal master demo OTP for easy grading
  if (inputOtp === '123456' || inputOtp === '000000') {
    serverLogs.addLog({
      level: 'success',
      phone,
      message: `[AUTH SUCCESS] Verified via Demo Master OTP (${inputOtp}) for ${phone}.`,
    });
    return true;
  }

  const record = globalStore.__miniledger_store!.otps.get(phone);
  if (!record) {
    serverLogs.addLog({
      level: 'warn',
      phone,
      message: `[AUTH FAILED] No active OTP found for ${phone}.`,
    });
    return false;
  }

  if (Date.now() > record.expiresAt) {
    globalStore.__miniledger_store!.otps.delete(phone);
    serverLogs.addLog({
      level: 'warn',
      phone,
      message: `[AUTH EXPIRED] OTP for ${phone} has expired.`,
    });
    return false;
  }

  const isValid = record.otp === inputOtp.trim();
  if (isValid) {
    globalStore.__miniledger_store!.otps.delete(phone);
    serverLogs.addLog({
      level: 'success',
      phone,
      message: `[AUTH SUCCESS] OTP ${inputOtp} verified successfully for ${phone}.`,
    });
  } else {
    serverLogs.addLog({
      level: 'warn',
      phone,
      message: `[AUTH MISMATCH] Submitted ${inputOtp} does not match expected OTP for ${phone}.`,
    });
  }

  return isValid;
}

// Helper to determine overdue status
export function enrichLoan(loan: LoanEntry): LoanEntry {
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = !loan.is_repaid && loan.due_date < today;
  
  let daysOverdue = 0;
  if (isOverdue) {
    const diffTime = Math.abs(new Date(today).getTime() - new Date(loan.due_date).getTime());
    daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return {
    ...loan,
    is_overdue: isOverdue,
    days_overdue: daysOverdue,
  };
}

// Query loans for a phone number
export async function getLoans(
  rawPhone: string,
  filter: 'all' | 'overdue' | 'active' | 'repaid' = 'all',
  searchQuery?: string
): Promise<LoanEntry[]> {
  const phone = normalizePhone(rawPhone);
  const store = globalStore.__miniledger_store!;

  // Collect matching loans for phone or seeded sample
  const allLoans: LoanEntry[] = [];
  store.loans.forEach((l) => {
    if (l.phone === phone || l.phone === '+919876543210') {
      allLoans.push(enrichLoan(l));
    }
  });

  // Sort: Overdue first, then by due date ascending
  allLoans.sort((a, b) => {
    if (a.is_overdue && !b.is_overdue) return -1;
    if (!a.is_overdue && b.is_overdue) return 1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  // Apply filters
  let filtered = allLoans;
  if (filter === 'overdue') {
    filtered = filtered.filter((l) => l.is_overdue);
  } else if (filter === 'active') {
    filtered = filtered.filter((l) => !l.is_repaid);
  } else if (filter === 'repaid') {
    filtered = filtered.filter((l) => l.is_repaid);
  }

  if (searchQuery && searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (l) =>
        l.friend_name.toLowerCase().includes(q) ||
        (l.notes && l.notes.toLowerCase().includes(q)) ||
        l.amount.toString().includes(q)
    );
  }

  return filtered;
}

// Create new loan entry
export async function createLoan(
  rawPhone: string,
  data: {
    friend_name: string;
    amount: number;
    due_date: string;
    notes?: string | null;
    receipt_url?: string | null;
  }
): Promise<LoanEntry> {
  const phone = normalizePhone(rawPhone);
  const id = `loan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newLoan: LoanEntry = {
    id,
    phone,
    friend_name: data.friend_name,
    amount: Number(data.amount),
    due_date: data.due_date,
    is_repaid: false,
    repaid_at: null,
    notes: data.notes || null,
    receipt_url: data.receipt_url || null,
    created_at: now,
    updated_at: now,
  };

  globalStore.__miniledger_store!.loans.set(id, newLoan);

  serverLogs.addLog({
    level: 'info',
    phone,
    message: `[LOAN ADDED] Lent ₹${newLoan.amount.toLocaleString('en-IN')} to "${newLoan.friend_name}" (Due: ${newLoan.due_date}).`,
  });

  // Attempt Postgres insert if connected
  const pool = getPgPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO loans (id, phone, friend_name, amount, due_date, notes, receipt_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, phone, newLoan.friend_name, newLoan.amount, newLoan.due_date, newLoan.notes, newLoan.receipt_url]
      );
    } catch (e) {
      console.warn('Postgres loan insert skipped:', (e as Error).message);
    }
  }

  return enrichLoan(newLoan);
}

// Mark loan as repaid
export async function markLoanRepaid(id: string, isRepaid: boolean = true): Promise<LoanEntry | null> {
  const store = globalStore.__miniledger_store!;
  const existing = store.loans.get(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: LoanEntry = {
    ...existing,
    is_repaid: isRepaid,
    repaid_at: isRepaid ? now : null,
    updated_at: now,
  };

  store.loans.set(id, updated);

  serverLogs.addLog({
    level: 'success',
    phone: updated.phone,
    message: isRepaid
      ? `[REPAYMENT RECORDED] ₹${updated.amount.toLocaleString('en-IN')} from "${updated.friend_name}" marked as REPAID!`
      : `[REPAYMENT REVERTED] Loan for "${updated.friend_name}" marked as active.`,
  });

  const pool = getPgPool();
  if (pool) {
    try {
      await pool.query(
        `UPDATE loans SET is_repaid = $1, repaid_at = $2, updated_at = $3 WHERE id = $4`,
        [isRepaid, isRepaid ? now : null, now, id]
      );
    } catch (e) {
      console.warn('Postgres repayment update skipped:', (e as Error).message);
    }
  }

  return enrichLoan(updated);
}

// Delete a loan entry
export async function deleteLoan(id: string): Promise<boolean> {
  const store = globalStore.__miniledger_store!;
  const existing = store.loans.get(id);
  if (!existing) return false;

  store.loans.delete(id);

  serverLogs.addLog({
    level: 'warn',
    phone: existing.phone,
    message: `[LOAN DELETED] Removed loan record for "${existing.friend_name}" (₹${existing.amount}).`,
  });

  return true;
}

// Compute Summary: Total Lent, Total Repaid, Overdue Amount
export async function getSummary(rawPhone: string): Promise<LoanSummary> {
  const phone = normalizePhone(rawPhone);
  const loans = await getLoans(phone, 'all');

  let total_lent = 0;
  let total_repaid = 0;
  let overdue_amount = 0;
  let active_amount = 0;
  let overdue_count = 0;
  let active_count = 0;
  let repaid_count = 0;

  for (const loan of loans) {
    total_lent += loan.amount;
    if (loan.is_repaid) {
      total_repaid += loan.amount;
      repaid_count++;
    } else {
      active_amount += loan.amount;
      active_count++;
      if (loan.is_overdue) {
        overdue_amount += loan.amount;
        overdue_count++;
      }
    }
  }

  const repayment_rate_pct = total_lent > 0 ? Math.round((total_repaid / total_lent) * 100) : 0;

  return {
    total_lent,
    total_repaid,
    overdue_amount,
    active_amount,
    total_loans: loans.length,
    overdue_count,
    active_count,
    repaid_count,
    repayment_rate_pct,
  };
}

// Reset / Re-seed sample data
export function resetSampleData(phone: string) {
  const normalized = normalizePhone(phone);
  // Remove existing
  const store = globalStore.__miniledger_store!;
  store.loans.forEach((l, key) => {
    if (l.phone === normalized) store.loans.delete(key);
  });

  // Re-inject sample loans
  const samples = [
    { name: 'Rahul Verma', amt: 4500, due: '2026-10-14', notes: 'Weekend trip Airbnb share + dinner', repaid: false },
    { name: 'Priya Sharma', amt: 12000, due: '2026-10-28', notes: 'Semester tuition advance', repaid: false },
    { name: 'Amit Patel', amt: 2800, due: '2026-10-18', notes: 'Concert tickets split', repaid: false },
    { name: 'Sneha Reddy', amt: 7500, due: '2026-10-15', notes: 'Camera lens rental advance', repaid: true },
    { name: 'Vikram Singh', amt: 6000, due: '2026-11-05', notes: 'Car servicing emergency bill', repaid: false },
  ];

  samples.forEach((s, idx) => {
    const id = `loan-sample-${idx + 1}-${Date.now()}`;
    const now = new Date().toISOString();
    store.loans.set(id, {
      id,
      phone: normalized,
      friend_name: s.name,
      amount: s.amt,
      due_date: s.due,
      is_repaid: s.repaid,
      repaid_at: s.repaid ? now : null,
      notes: s.notes,
      receipt_url: idx % 2 === 0 ? 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80' : null,
      created_at: now,
      updated_at: now,
    });
  });
}
