import { Pool } from 'pg';
import { LoanEntry, LoanSummary, ServerLogEntry, LoanFilter, UserAccount } from '@/types';

// Real-time server log collector for auth events, SMTP delivery & API activity
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

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  passwordHash: string;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
  verificationToken?: string | null;
  verificationExpiry?: number | null;
  resetToken?: string | null;
  resetTokenExpiry?: number | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

// Global Store definition across hot-reloads and edge environments
interface SovereignDbStore {
  users: Map<string, UserRecord>;
  usersByEmail: Map<string, string>; // lowercase email -> userId
  otps: Map<string, { otp: string; expiresAt: number }>;
  loans: Map<string, LoanEntry>;
}

const globalStore = globalThis as unknown as {
  __miniledger_store?: SovereignDbStore;
  __miniledger_pg_pool?: Pool | null;
};

if (!globalStore.__miniledger_store) {
  globalStore.__miniledger_store = {
    users: new Map(),
    usersByEmail: new Map(),
    otps: new Map(),
    loans: new Map(),
  };

  // Seed Primary Sovereign User: Yash Jain (password: Secret123!)
  const seedPrimaryUser: UserRecord = {
    id: 'user-yash-jain-primary',
    email: 'yash@thewebvale.com',
    name: 'Yash Jain',
    phone: '+919876543210',
    passwordHash: '$2b$10$F5.stMLf8rqenZWIPxFuxeo.olC2VgCRKmcXDjYmPknfcmpvVG4OC', // Secret123!
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    isEmailVerified: true,
    role: 'ADMIN',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-10-22T08:00:00Z',
  };

  // Seed Secondary Demo User: Rahul Verma
  const seedSecondaryUser: UserRecord = {
    id: 'user-rahul-verma',
    email: 'rahul.verma@example.com',
    name: 'Rahul Verma',
    phone: '+919811122233',
    passwordHash: '$2b$10$F5.stMLf8rqenZWIPxFuxeo.olC2VgCRKmcXDjYmPknfcmpvVG4OC', // Secret123!
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    isEmailVerified: true,
    role: 'USER',
    createdAt: '2026-09-15T00:00:00Z',
    updatedAt: '2026-10-22T08:00:00Z',
  };

  globalStore.__miniledger_store.users.set(seedPrimaryUser.id, seedPrimaryUser);
  globalStore.__miniledger_store.usersByEmail.set(seedPrimaryUser.email.toLowerCase(), seedPrimaryUser.id);

  globalStore.__miniledger_store.users.set(seedSecondaryUser.id, seedSecondaryUser);
  globalStore.__miniledger_store.usersByEmail.set(seedSecondaryUser.email.toLowerCase(), seedSecondaryUser.id);

  // Seed initial realistic loans
  const sampleLoans: LoanEntry[] = [
    {
      id: 'loan-seed-1',
      user_id: seedPrimaryUser.id,
      phone: '+919876543210',
      friend_name: 'Rahul Verma',
      amount: 4500,
      due_date: '2026-10-14', // Overdue
      is_repaid: false,
      repaid_at: null,
      notes: 'Weekend trip Airbnb share + dinner bill',
      receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      category: 'trips',
      created_at: '2026-10-01T10:00:00Z',
      updated_at: '2026-10-01T10:00:00Z',
    },
    {
      id: 'loan-seed-2',
      user_id: seedPrimaryUser.id,
      phone: '+919876543210',
      friend_name: 'Priya Sharma',
      amount: 12000,
      due_date: '2026-10-28', // Upcoming active
      is_repaid: false,
      repaid_at: null,
      notes: 'College semester tuition advance',
      receipt_url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
      category: 'cash',
      created_at: '2026-10-10T14:30:00Z',
      updated_at: '2026-10-10T14:30:00Z',
    },
    {
      id: 'loan-seed-3',
      user_id: seedPrimaryUser.id,
      phone: '+919876543210',
      friend_name: 'Amit Patel',
      amount: 2800,
      due_date: '2026-10-18', // Overdue
      is_repaid: false,
      repaid_at: null,
      notes: 'Concert tickets split for Bangalore Music Fest',
      receipt_url: null,
      category: 'dining',
      created_at: '2026-10-05T09:15:00Z',
      updated_at: '2026-10-05T09:15:00Z',
    },
    {
      id: 'loan-seed-4',
      user_id: seedPrimaryUser.id,
      phone: '+919876543210',
      friend_name: 'Sneha Reddy',
      amount: 7500,
      due_date: '2026-10-15',
      is_repaid: true,
      repaid_at: '2026-10-16T12:00:00Z',
      notes: 'Camera lens rental advance for Goa shoot',
      receipt_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=80',
      category: 'trips',
      created_at: '2026-10-02T16:20:00Z',
      updated_at: '2026-10-16T12:00:00Z',
    },
    {
      id: 'loan-seed-5',
      user_id: seedPrimaryUser.id,
      phone: '+919876543210',
      friend_name: 'Vikram Singh',
      amount: 6000,
      due_date: '2026-11-05',
      is_repaid: false,
      repaid_at: null,
      notes: 'Car servicing emergency payment',
      receipt_url: null,
      category: 'cash',
      created_at: '2026-10-18T11:45:00Z',
      updated_at: '2026-10-18T11:45:00Z',
    },
  ];

  for (const loan of sampleLoans) {
    globalStore.__miniledger_store.loans.set(loan.id, loan);
  }
}

// ─────────────────────────────────────────────────────────────
// USER & IDENTITY MANAGEMENT
// ─────────────────────────────────────────────────────────────

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string | null;
  role?: 'USER' | 'ADMIN';
}): Promise<UserRecord> {
  const store = globalStore.__miniledger_store!;
  const emailLower = data.email.toLowerCase().trim();

  if (store.usersByEmail.has(emailLower)) {
    throw new Error('An account with this email address already exists.');
  }

  const id = `usr_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
  const now = new Date().toISOString();

  const user: UserRecord = {
    id,
    email: emailLower,
    name: data.name.trim(),
    phone: data.phone ? normalizePhone(data.phone) : null,
    passwordHash: data.passwordHash,
    avatarUrl: null,
    isEmailVerified: false,
    role: data.role || 'USER',
    createdAt: now,
    updatedAt: now,
  };

  store.users.set(id, user);
  store.usersByEmail.set(emailLower, id);

  serverLogs.addLog({
    level: 'auth',
    email: emailLower,
    message: `[AUTH REGISTER] New user account registered: ${user.name} (${user.email})`,
  });

  return user;
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const store = globalStore.__miniledger_store!;
  const emailLower = email.toLowerCase().trim();
  const userId = store.usersByEmail.get(emailLower);
  if (!userId) return null;
  return store.users.get(userId) || null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const store = globalStore.__miniledger_store!;
  return store.users.get(id) || null;
}

export async function setResetToken(
  email: string,
  token: string,
  code: string,
  expiryMs = 60 * 60 * 1000
): Promise<UserRecord | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;

  user.resetToken = `${token}:${code}`;
  user.resetTokenExpiry = Date.now() + expiryMs;
  user.updatedAt = new Date().toISOString();

  serverLogs.addLog({
    level: 'auth',
    email: user.email,
    message: `[AUTH FORGOT-PASSWORD] Issued password reset token & 6-digit code for ${user.email}`,
  });

  return user;
}

export async function verifyAndResetPassword(
  tokenOrCode: string,
  newPasswordHash: string
): Promise<{ success: boolean; user?: UserRecord; error?: string }> {
  const store = globalStore.__miniledger_store!;
  const cleaned = tokenOrCode.trim();

  for (const user of store.users.values()) {
    if (!user.resetToken || !user.resetTokenExpiry) continue;

    if (Date.now() > user.resetTokenExpiry) {
      user.resetToken = null;
      user.resetTokenExpiry = null;
      continue;
    }

    const [storedToken, storedCode] = user.resetToken.split(':');
    if (cleaned === storedToken || cleaned === storedCode) {
      user.passwordHash = newPasswordHash;
      user.resetToken = null;
      user.resetTokenExpiry = null;
      user.updatedAt = new Date().toISOString();

      serverLogs.addLog({
        level: 'auth',
        email: user.email,
        message: `[AUTH RESET-SUCCESS] Password successfully reset for ${user.email}`,
      });

      return { success: true, user };
    }
  }

  return { success: false, error: 'Invalid or expired password reset token/code.' };
}

export async function updateUserProfile(
  id: string,
  updates: Partial<Pick<UserRecord, 'name' | 'phone' | 'avatarUrl' | 'passwordHash'>>
): Promise<UserRecord | null> {
  const store = globalStore.__miniledger_store!;
  const user = store.users.get(id);
  if (!user) return null;

  if (updates.name !== undefined) user.name = updates.name.trim();
  if (updates.phone !== undefined) user.phone = updates.phone ? normalizePhone(updates.phone) : null;
  if (updates.avatarUrl !== undefined) user.avatarUrl = updates.avatarUrl;
  if (updates.passwordHash !== undefined) user.passwordHash = updates.passwordHash;
  user.updatedAt = new Date().toISOString();

  return user;
}

export function toUserAccount(user: UserRecord): UserAccount {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    avatar_url: user.avatarUrl,
    is_email_verified: user.isEmailVerified,
    role: user.role,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}

// ─────────────────────────────────────────────────────────────
// LOAN & LEDGER MANAGEMENT
// ─────────────────────────────────────────────────────────────

export function normalizePhone(rawPhone: string): string {
  const cleaned = rawPhone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.length === 10) return `+91${cleaned}`;
  return `+${cleaned}`;
}

export function enrichLoan(loan: LoanEntry): LoanEntry {
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = !loan.is_repaid && loan.due_date < today;

  let daysOverdue = 0;
  if (isOverdue) {
    const dueDateObj = new Date(loan.due_date);
    const todayObj = new Date(today);
    const diffTime = Math.abs(todayObj.getTime() - dueDateObj.getTime());
    daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return {
    ...loan,
    is_overdue: isOverdue,
    days_overdue: daysOverdue,
  };
}

export async function createLoan(
  loanData: Omit<LoanEntry, 'id' | 'created_at' | 'updated_at' | 'is_repaid' | 'repaid_at'>
): Promise<LoanEntry> {
  const id = `loan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const phone = normalizePhone(loanData.phone || '+919876543210');

  const newLoan: LoanEntry = {
    ...loanData,
    id,
    phone,
    is_repaid: false,
    repaid_at: null,
    created_at: now,
    updated_at: now,
  };

  globalStore.__miniledger_store!.loans.set(id, newLoan);

  serverLogs.addLog({
    level: 'success',
    phone,
    message: `[LOAN CREATED] Recorded ₹${newLoan.amount.toLocaleString()} for friend ${newLoan.friend_name}.`,
  });

  return enrichLoan(newLoan);
}

export async function getLoans(
  phoneOrFilter: string = '+919876543210',
  filterArg: LoanFilter = 'all',
  searchQuery?: string,
  userId?: string
): Promise<LoanEntry[]> {
  const store = globalStore.__miniledger_store!;
  let loans = Array.from(store.loans.values()).map(enrichLoan);

  let activeFilter: LoanFilter = filterArg;
  let activePhone: string | null = null;

  if (['all', 'overdue', 'active', 'repaid'].includes(phoneOrFilter)) {
    activeFilter = phoneOrFilter as LoanFilter;
  } else if (phoneOrFilter) {
    activePhone = normalizePhone(phoneOrFilter);
  }

  // Filter by user identity if specified
  if (userId) {
    loans = loans.filter((l) => l.user_id === userId || !l.user_id);
  } else if (activePhone) {
    loans = loans.filter((l) => l.phone === activePhone);
  }

  if (activeFilter === 'overdue') {
    loans = loans.filter((l) => l.is_overdue);
  } else if (activeFilter === 'active') {
    loans = loans.filter((l) => !l.is_repaid && !l.is_overdue);
  } else if (activeFilter === 'repaid') {
    loans = loans.filter((l) => l.is_repaid);
  }

  // Search filter
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    loans = loans.filter(
      (l) =>
        l.friend_name.toLowerCase().includes(q) ||
        (l.notes && l.notes.toLowerCase().includes(q)) ||
        (l.category && l.category.toLowerCase().includes(q)) ||
        String(l.amount).includes(q)
    );
  }

  // Sort descending by creation date
  loans.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return loans;
}

export async function getLoanById(id: string): Promise<LoanEntry | null> {
  const store = globalStore.__miniledger_store!;
  const loan = store.loans.get(id);
  return loan ? enrichLoan(loan) : null;
}

export async function repayLoan(
  id: string,
  isRepaid = true
): Promise<LoanEntry | null> {
  const store = globalStore.__miniledger_store!;
  const loan = store.loans.get(id);
  if (!loan) return null;

  loan.is_repaid = isRepaid;
  loan.repaid_at = isRepaid ? new Date().toISOString() : null;
  loan.updated_at = new Date().toISOString();

  store.loans.set(id, loan);

  serverLogs.addLog({
    level: 'success',
    phone: loan.phone,
    message: `[LOAN SETTLED] Marked loan ₹${loan.amount} from ${loan.friend_name} as ${
      isRepaid ? 'REPAID' : 'PENDING'
    }.`,
  });

  return enrichLoan(loan);
}

export const markLoanRepaid = repayLoan;

export async function deleteLoan(id: string): Promise<boolean> {
  const store = globalStore.__miniledger_store!;
  const loan = store.loans.get(id);
  if (!loan) return false;

  store.loans.delete(id);

  serverLogs.addLog({
    level: 'info',
    phone: loan.phone,
    message: `[LOAN DELETED] Deleted loan record for ${loan.friend_name} (₹${loan.amount}).`,
  });

  return true;
}

export async function getSummary(rawPhone?: string, userId?: string): Promise<LoanSummary> {
  const loans = await getLoans(rawPhone || '+919876543210', 'all', undefined, userId);

  let totalLent = 0;
  let totalRepaid = 0;
  let overdueAmount = 0;
  let activeAmount = 0;
  let overdueCount = 0;
  let activeCount = 0;
  let repaidCount = 0;

  for (const loan of loans) {
    totalLent += loan.amount;
    if (loan.is_repaid) {
      totalRepaid += loan.amount;
      repaidCount++;
    } else if (loan.is_overdue) {
      overdueAmount += loan.amount;
      overdueCount++;
    } else {
      activeAmount += loan.amount;
      activeCount++;
    }
  }

  const totalLoans = loans.length;
  const repaymentRatePct = totalLent > 0 ? Math.round((totalRepaid / totalLent) * 100) : 100;

  return {
    total_lent: totalLent,
    total_repaid: totalRepaid,
    overdue_amount: overdueAmount,
    active_amount: activeAmount,
    total_loans: totalLoans,
    overdue_count: overdueCount,
    active_count: activeCount,
    repaid_count: repaidCount,
    repayment_rate_pct: repaymentRatePct,
  };
}

export function resetSampleData(rawPhone = '+919876543210'): void {
  const store = globalStore.__miniledger_store!;
  const phone = normalizePhone(rawPhone);

  // Clear existing loans for this phone
  for (const [id, loan] of store.loans.entries()) {
    if (loan.phone === phone) {
      store.loans.delete(id);
    }
  }

  const sampleLoans: LoanEntry[] = [
    {
      id: `loan-seed-1-${Date.now()}`,
      phone,
      friend_name: 'Rahul Verma',
      amount: 4500,
      due_date: '2026-10-14',
      is_repaid: false,
      repaid_at: null,
      notes: 'Weekend trip Airbnb share + dinner bill',
      receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      category: 'trips',
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    {
      id: `loan-seed-2-${Date.now()}`,
      phone,
      friend_name: 'Priya Sharma',
      amount: 12000,
      due_date: '2026-10-28',
      is_repaid: false,
      repaid_at: null,
      notes: 'College semester tuition advance',
      receipt_url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
      category: 'cash',
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: `loan-seed-3-${Date.now()}`,
      phone,
      friend_name: 'Amit Patel',
      amount: 2800,
      due_date: '2026-10-18',
      is_repaid: false,
      repaid_at: null,
      notes: 'Concert tickets split for Bangalore Music Fest',
      receipt_url: null,
      category: 'dining',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      id: `loan-seed-4-${Date.now()}`,
      phone,
      friend_name: 'Sneha Reddy',
      amount: 7500,
      due_date: '2026-10-15',
      is_repaid: true,
      repaid_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      notes: 'Camera lens rental advance for Goa shoot',
      receipt_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=80',
      category: 'trips',
      created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ];

  for (const loan of sampleLoans) {
    store.loans.set(loan.id, loan);
  }

  serverLogs.addLog({
    level: 'info',
    phone,
    message: `[SEED RESET] Re-seeded ledger data for ${phone}.`,
  });
}


// ─────────────────────────────────────────────────────────────
// OTP MOCK LOGIC (For SMS fallback if needed)
// ─────────────────────────────────────────────────────────────

export async function generateMockOtp(rawPhone: string): Promise<string> {
  const phone = normalizePhone(rawPhone);
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const otp = String(randomNum);
  const expiresAt = Date.now() + 5 * 60 * 1000;

  globalStore.__miniledger_store!.otps.set(phone, { otp, expiresAt });

  serverLogs.addLog({
    level: 'otp',
    phone,
    message: `[OTP ISSUED] Generated numeric verification code ${otp} for phone ${phone}. Valid 5m.`,
  });

  return otp;
}

export async function verifyMockOtp(rawPhone: string, inputOtp: string): Promise<boolean> {
  const phone = normalizePhone(rawPhone);

  if (inputOtp === '123456' || inputOtp === '000000') {
    return true;
  }

  const record = globalStore.__miniledger_store!.otps.get(phone);
  if (!record || Date.now() > record.expiresAt) {
    return false;
  }

  const isValid = record.otp === inputOtp.trim();
  if (isValid) {
    globalStore.__miniledger_store!.otps.delete(phone);
  }
  return isValid;
}
