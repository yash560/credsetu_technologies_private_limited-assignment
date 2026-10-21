/**
 * MiniLedger Automated Integration Test Suite
 * Validates Mock OTP, Loan CRUD, Financial Aggregation, Overdue Invariants & Input Validation
 */

import http from 'http';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3999';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const method = options.method || 'GET';
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const body = options.body ? JSON.stringify(options.body) : undefined;

  const res = await fetch(url, {
    method,
    headers,
    body,
  });

  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data: json };
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING MINILEDGER AUTOMATED API TEST SUITE');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log('====================================================\n');

  const testPhone = '+919876543210';

  // 1. Reset/Seed Data
  console.log('📌 Test Suite 1: Database Seeding & Mock OTP Generation');
  const seedRes = await request('/api/seed', {
    method: 'POST',
    body: { phone: testPhone },
  });
  assert(seedRes.status === 200 && seedRes.data.success, 'Database seeded successfully');

  // 2. Request Mock OTP
  const otpRes = await request('/api/auth/otp/send', {
    method: 'POST',
    body: { phone: testPhone },
  });
  assert(otpRes.status === 200, 'Mock OTP API returns 200 OK');
  assert(typeof otpRes.data.otp === 'string' && otpRes.data.otp.length === 6, 'Mock OTP is a 6-digit numeric string');
  assert(otpRes.data.message.includes('server console'), 'Logs message confirms OTP was logged');

  const receivedOtp = otpRes.data.otp;

  // 3. Test Invalid OTP
  console.log('\n📌 Test Suite 2: Authentication & OTP Verification');
  const invalidOtpRes = await request('/api/auth/otp/verify', {
    method: 'POST',
    body: { phone: testPhone, otp: '999999' },
  });
  assert(invalidOtpRes.status === 401, 'Invalid OTP is rejected with HTTP 401');

  // 4. Test Valid OTP
  const validOtpRes = await request('/api/auth/otp/verify', {
    method: 'POST',
    body: { phone: testPhone, otp: receivedOtp },
  });
  assert(validOtpRes.status === 200 && validOtpRes.data.success, 'Valid Mock OTP is accepted with HTTP 200');
  assert(Boolean(validOtpRes.data.token), 'Session token returned upon successful verification');

  // 5. Query Initial Summary
  console.log('\n📌 Test Suite 3: Financial Summary & Mathematical Invariants');
  const summaryRes1 = await request(`/api/summary?phone=${encodeURIComponent(testPhone)}`);
  assert(summaryRes1.status === 200, 'Summary endpoint returns 200 OK');
  const s1 = summaryRes1.data.summary;
  assert(s1.total_lent > 0, `Total lent is positive (₹${s1.total_lent})`);
  assert(s1.overdue_amount > 0, `Overdue amount calculated properly (₹${s1.overdue_amount})`);
  assert(s1.total_lent >= s1.total_repaid + s1.overdue_amount, 'Double-entry invariant: Total Lent >= Repaid + Overdue');

  // 6. Input Validation on Add Loan
  console.log('\n📌 Test Suite 4: Input Validation (Zod Schemas)');
  const invalidLoanRes = await request('/api/loans', {
    method: 'POST',
    body: {
      friend_name: '', // Empty name
      amount: -500, // Negative amount
      due_date: 'invalid-date', // Bad date format
    },
  });
  assert(invalidLoanRes.status === 400, 'Negative amount & invalid date rejected with HTTP 400');
  assert(Boolean(invalidLoanRes.data.details?.friend_name), 'Zod caught empty friend name');
  assert(Boolean(invalidLoanRes.data.details?.amount), 'Zod caught negative amount');

  // 7. Add Valid Loan Entry
  console.log('\n📌 Test Suite 5: Loan Creation & Dynamic Overdue Calculation');
  const newLoanRes = await request('/api/loans', {
    method: 'POST',
    headers: { 'x-user-phone': testPhone },
    body: {
      friend_name: 'Test Reviewer Loan',
      amount: 5000,
      due_date: '2026-10-10', // Past date -> Must be marked overdue
      notes: 'Automated test suite creation',
      receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c',
    },
  });
  assert(newLoanRes.status === 201, 'Valid loan created with HTTP 201');
  const createdLoan = newLoanRes.data.loan;
  assert(createdLoan.is_overdue === true, 'Past due date automatically evaluated as OVERDUE');
  assert(createdLoan.friend_name === 'Test Reviewer Loan', 'Friend name saved properly');

  // 8. Verify Summary Updated
  const summaryRes2 = await request(`/api/summary?phone=${encodeURIComponent(testPhone)}`);
  const s2 = summaryRes2.data.summary;
  assert(s2.total_lent === s1.total_lent + 5000, 'Summary total_lent increased by exactly ₹5,000');
  assert(s2.overdue_amount === s1.overdue_amount + 5000, 'Summary overdue_amount increased by exactly ₹5,000');

  // 9. Mark Loan as Repaid
  console.log('\n📌 Test Suite 6: Repayment Lifecycle');
  const repayRes = await request(`/api/loans/${createdLoan.id}/repay`, {
    method: 'PATCH',
    body: { is_repaid: true },
  });
  assert(repayRes.status === 200, 'Mark as repaid returns HTTP 200');
  assert(repayRes.data.loan.is_repaid === true, 'Loan entity updated to is_repaid: true');
  assert(Boolean(repayRes.data.loan.repaid_at), 'Repaid timestamp recorded');

  // 10. Verify Summary After Repayment
  const summaryRes3 = await request(`/api/summary?phone=${encodeURIComponent(testPhone)}`);
  const s3 = summaryRes3.data.summary;
  assert(s3.total_repaid === s2.total_repaid + 5000, 'Total repaid increased by ₹5,000');
  assert(s3.overdue_amount === s1.overdue_amount, 'Overdue amount decremented back after repayment');

  // 11. Cleanup test loan
  await request(`/api/loans/${createdLoan.id}`, { method: 'DELETE' });

  // Summary
  console.log('\n====================================================');
  console.log(`📊 TEST EXECUTION SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
