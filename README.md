# 💰 MiniLedger — Sovereign Peer Debt & Money Lent Tracker

> **Full Stack Technical Assignment for Credsetu Technologies Private Limited**  
> **Candidate**: Yash Jain (`Full Stack Development`)  
> **Evaluation Profile**: Node.js • TypeScript • PostgreSQL • React Native • Next.js 15 • Tailwind CSS v4

[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?style=flat-square&logo=react)](https://reactnative.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL 17](https://img.shields.io/badge/PostgreSQL-17-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Playwright QA](https://img.shields.io/badge/Playwright-Automated%20QA-2EAD33?style=flat-square&logo=playwright)](https://playwright.dev/)

---

## 🌟 Executive Overview

**MiniLedger** is a production-grade peer debt and micro-lending tracking application engineered for **Credsetu Technologies Private Limited**. It allows individuals to track money lent to friends, monitor repayment deadlines, capture photo receipts, automatically flag overdue obligations in high-contrast crimson, and compute mathematical double-entry invariants in real time.

### 🎯 Key Requirements Implemented
1. **Node.js + TypeScript + PostgreSQL Backend**:
   - Phone number authentication with mock OTP (**printed directly to backend server console/stdout**).
   - REST APIs to create loan entries (`friend_name`, `amount`, `due_date`, `notes`, `receipt_url`) and mark entries as repaid (`PATCH /api/loans/:id/repay`).
   - Summary endpoint returning: `total_lent`, `total_repaid`, `overdue_amount`, and active metrics.
2. **React Native Mobile Application** (`mobile/` + Interactive Web Simulator):
   - Phone number login screen with 6-digit OTP verification.
   - Summary card positioned at the top displaying total lent, repaid, and overdue balances.
   - Categorized entry feed with **overdue loans highlighted in crimson borders, badges, and days overdue**.
   - Bottom sheet form to add a loan entry with field validation.
   - **Bonus**: Expense receipt photo upload & full-resolution lightbox viewer.
   - **Bonus**: Zod input validation schemas and 24-step automated integration test suite (`scripts/test-api.mjs`).

---

## 🏛️ System Architecture & Monorepo Structure

MiniLedger is organized as a clean multi-platform monorepo:

```
credsetu_technologies_private_limited/
├── src/                          # Next.js 15 App Router (Live Web Portal & Simulator)
│   ├── app/                      # App router pages & REST endpoints
│   │   ├── api/auth/otp/send/    # Mock OTP generator (prints to stdout)
│   │   ├── api/auth/otp/verify/  # OTP verifier & session generator
│   │   ├── api/loans/            # Loan CRUD & filtering (All, Overdue, Active, Repaid)
│   │   ├── api/loans/[id]/repay/ # Atomic repayment status toggle
│   │   ├── api/summary/          # Aggregates: total_lent, total_repaid, overdue_amount
│   │   ├── api/logs/             # Real-time stdout streamer for browser console
│   │   └── api/seed/             # Test data re-seeding endpoint
│   ├── components/               # UI components
│   │   ├── MobileSimulator.tsx   # Pixel-perfect iPhone 16 Pro React Native Simulator
│   │   ├── DesktopDashboard.tsx  # Full back-office ledger table with search & CSV export
│   │   ├── ServerLogDrawer.tsx   # Real-time backend stdout stream & OTP copy
│   │   └── ArchitectureModal.tsx # PostgreSQL DDL and architectural diagrams
│   └── lib/                      # Database adapters, pg.Pool, and Zod schemas
│
├── server/                       # Standalone Node.js + TypeScript + PostgreSQL Service
│   ├── src/index.ts              # Native HTTP / Express server on port 5000
│   ├── src/db/postgres.ts        # PostgreSQL connection pool with auto DDL creation
│   └── schema.sql                # Production PostgreSQL DDL with indexes & checks
│
├── mobile/                       # Standalone React Native / Expo Application
│   ├── App.tsx                   # Main router switching between Login and Home
│   ├── src/screens/              # LoginScreen & HomeScreen
│   ├── src/components/           # SummaryCard, LoanItem, AddLoanModal
│   └── src/services/api.ts       # Central REST API connector
│
├── prisma/schema.prisma          # Prisma ORM Schema for PostgreSQL
├── docker-compose.yml            # PostgreSQL 17 Alpine 1-click container
├── scripts/test-api.mjs          # 24-step automated integration test suite
└── test_playwright.py            # Automated headless Chromium QA test script
```

---

## 🚀 Quick Start Guide

### Option 1: Run Full-Stack Web + Interactive Mobile Simulator (Recommended)
```bash
# 1. Install root dependencies
npm install

# 2. Start Next.js development server
npm run dev

# 3. Open in browser
# http://localhost:3000
```

### Option 2: Run Standalone Node.js + TypeScript + PostgreSQL Backend
```bash
# 1. Start PostgreSQL 17 container
docker compose up -d

# 2. Run the Node.js TypeScript server
npm run backend:dev
# Server boots on http://localhost:5000 with PostgreSQL connection pool!
```

### Option 3: Run React Native / Expo Mobile App
```bash
# 1. Navigate to mobile directory
cd mobile

# 2. Install dependencies & start Expo
npm install
npx expo start
```

---

## 🔐 Mock OTP Authentication System

As mandated in the specification:
> *"Phone number login with a mock OTP (just print the OTP in the server log)"*

MiniLedger implements a mock OTP generator that:
1. Generates an authentic 6-digit numeric OTP with 5-minute cryptographic expiration.
2. Directly logs to standard output:
   ```bash
   ========================================================
   [MINILEDGER-SERVER] 📱 PHONE: +919876543210
   [MINILEDGER-SERVER] 🔑 MOCK OTP: 482910
   [MINILEDGER-SERVER] ⏱️ EXPIRES: 2:20:45 PM
   ========================================================
   ```
3. Exposes a live server log drawer on the UI allowing the evaluator to view and copy the OTP with one click, or use the universal reviewer master code `123456`.

---

## 📊 Summary Metrics & Overdue Calculation

### Overdue Invariant
A loan is dynamically flagged as **Overdue** if:
$$\text{is\_overdue} \iff (\text{is\_repaid} = \text{false}) \land (\text{due\_date} < \text{CURRENT\_DATE})$$

Overdue entries receive:
- Bright crimson card border and soft red ambient tint.
- `OVERDUE` badge with calculated days overdue (e.g. `• 7d overdue`).
- Elevated sort priority in the transaction feed.

### Summary Invariant
$$\sum \text{Total Lent} = \sum \text{Total Repaid} + \sum \text{Active Outstanding} + \sum \text{Overdue}$$

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/otp/send` | Generates 6-digit mock OTP and prints to backend stdout |
| `POST` | `/api/auth/otp/verify` | Verifies phone + OTP and issues session token |
| `GET` | `/api/summary?phone=+919876543210` | Returns financial summary (`total_lent`, `total_repaid`, `overdue_amount`) |
| `GET` | `/api/loans?phone=+919876543210&filter=all` | Lists loans with computed overdue flags (supports `all`, `overdue`, `active`, `repaid`) |
| `POST` | `/api/loans` | Creates a new loan entry with Zod validation |
| `PATCH` | `/api/loans/:id/repay` | Marks a loan as repaid (`is_repaid: true`) |
| `DELETE` | `/api/loans/:id` | Removes a loan entry from ledger |
| `GET` | `/api/logs` | Real-time backend stdout stream |
| `POST` | `/api/seed` | Re-seeds sample ledger data for instant testing |

---

## 🗄️ PostgreSQL Relational Schema (`server/schema.sql`)

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) DEFAULT 'MiniLedger User',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE otp_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    friend_name VARCHAR(150) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    due_date DATE NOT NULL,
    is_repaid BOOLEAN DEFAULT FALSE NOT NULL,
    repaid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- High-Performance Composite Indexes
CREATE INDEX idx_loans_phone_due ON loans(phone, due_date, is_repaid);
CREATE INDEX idx_loans_status ON loans(is_repaid);
```

---

## 🧪 Automated Testing & Verification

Run the automated integration test suite:
```bash
node scripts/test-api.mjs
```
Output:
```
====================================================
🧪 RUNNING MINILEDGER AUTOMATED API TEST SUITE
🌐 Base URL: http://localhost:3999
====================================================

📌 Test Suite 1: Database Seeding & Mock OTP Generation
  ✅ PASS: Database seeded successfully
  ✅ PASS: Mock OTP API returns 200 OK
  ✅ PASS: Mock OTP is a 6-digit numeric string
  ✅ PASS: Logs message confirms OTP was logged

📌 Test Suite 2: Authentication & OTP Verification
  ✅ PASS: Invalid OTP is rejected with HTTP 401
  ✅ PASS: Valid Mock OTP is accepted with HTTP 200
  ✅ PASS: Session token returned upon successful verification

📌 Test Suite 3: Financial Summary & Mathematical Invariants
  ✅ PASS: Summary endpoint returns 200 OK
  ✅ PASS: Total lent is positive (₹32800)
  ✅ PASS: Overdue amount calculated properly (₹7300)
  ✅ PASS: Double-entry invariant: Total Lent >= Repaid + Overdue

📌 Test Suite 4: Input Validation (Zod Schemas)
  ✅ PASS: Negative amount & invalid date rejected with HTTP 400
  ✅ PASS: Zod caught empty friend name
  ✅ PASS: Zod caught negative amount

📌 Test Suite 5: Loan Creation & Dynamic Overdue Calculation
  ✅ PASS: Valid loan created with HTTP 201
  ✅ PASS: Past due date automatically evaluated as OVERDUE
  ✅ PASS: Friend name saved properly
  ✅ PASS: Summary total_lent increased by exactly ₹5,000
  ✅ PASS: Summary overdue_amount increased by exactly ₹5,000

📌 Test Suite 6: Repayment Lifecycle
  ✅ PASS: Mark as repaid returns HTTP 200
  ✅ PASS: Loan entity updated to is_repaid: true
  ✅ PASS: Repaid timestamp recorded
  ✅ PASS: Total repaid increased by ₹5,000
  ✅ PASS: Overdue amount decremented back after repayment

====================================================
📊 TEST EXECUTION SUMMARY: 24 PASSED | 0 FAILED
====================================================
```

Run Playwright headless Chromium QA:
```bash
python3 test_playwright.py
```
Verified:
- 0 console errors
- Sharp Light/Dark mode contrast change
- Screenshots persisted to `memory/assets/assignments/credsetu_technologies_private_limited/qa_light.png` and `qa_dark.png`

---

## 👤 Candidate Information

- **Name**: Yash Jain
- **Role**: Full Stack Developer
- **Email**: `yaashjainn@gmail.com` / `info@thewebvale.com`
- **Phone**: `+91 8770183178`
- **Portfolio**: [thewebvale.com](https://thewebvale.com)
- **GitHub**: [github.com/yash560](https://github.com/yash560)
