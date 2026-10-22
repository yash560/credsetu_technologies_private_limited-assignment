# 📐 PRODUCT FEATURE MATRIX: MiniLedger (Credsetu Technologies)
### Exhaustive Functional Requirements & User Journey Specification
Version: 2.0.0 (Redesigned from Scratch)
Author: Product Architect Subagent (TheWebVale Engine)

---

## 🧭 Executive Summary & Value Proposition
**MiniLedger** is a high-density, touch-alive personal finance platform designed to track money lent to and borrowed from friends. It eliminates social awkwardness through crystal-clear ledger transparency, polite automated reminders, and instant digital settlements.

---

## 👥 User Personas & Permission Scopes
| Persona | Key Goal | Primary Jobs-to-be-Done (JTBD) |
|---|---|---|
| **Lender (Primary User)** | Track active loans, see overdue amounts at a glance, and send gentle reminders without confrontation. | Log loan, attach receipt, check cash flow status, trigger WhatsApp reminder link, mark full/partial repayment. |
| **Friend (Borrower)** | Receive clear payment requests, inspect receipt proof, and confirm repayment without friction. | View debt breakdown via shareable link, view original bill/receipt, confirm settlement via UPI QR. |

---

## 🌲 Complete Functional Feature Decomposition Tree

### Module 1: Smart Identity & Session Cockpit
- **1.1 Phone & OTP Authentication**: Clean 10-digit mobile number entry, instantaneous real OTP delivery, secure session cookie.
- **1.2 Multi-Account / Multi-Workspace Selector**: Personal Ledger vs Shared Group/Trip Ledger.
- **1.3 User Profile Squircle**: Initials badge, phone number, total net balance pill (`+₹12,400` in emerald).

### Module 2: The 3-Zone Ledger Cockpit Layout
- **2.1 Left Navigation Rail (`w-64`)**:
  - Brand header: MiniLedger squircle icon + wordmark.
  - Primary navigation: `All Entries`, `Overdue [3]`, `Settled`, `Friends [8]`, `Analytics`.
  - Categories filter: `Dining & Drinks`, `Travel & Trips`, `Rent & Bills`, `Emergency Cash`.
  - Bottom persistent help card: `Need help? Ask Ledger Assistant →`.
- **2.2 Sticky Global Command Bar**:
  - Global fuzzy search (`⌘K`): Search by friend name, amount, or tag.
  - Filter pills: `All`, `Pending`, `Overdue`, `Settled`.
  - Theme mode toggle: Light Mode vs Dark Mode (instant zero-CLS switch).
- **2.3 Contextual Hero Greeting**:
  - Eyebrow badge: `👋 GOOD MORNING, YASH ☀️`.
  - Dynamic Cashflow Summary: Total Lent, Total Repaid, and Overdue Amount.
  - Ambient handwritten note: *"Healthy relationships start with clear numbers."*
- **2.4 Interactive Quick-Loan Command Box**:
  - 1-click inline borrower picker, amount input (`₹`), due date calendar picker, and `+ Record Loan` action button.
- **2.5 Split Bento Grid**:
  - **Card A (Cashflow Momentum Banner)**: High-impact dark banner with recovery rate indicator (`82% collected this month`) and `Send batch reminders →` CTA.
  - **Card B (Overdue Diagnostic Sparkline)**: Live green/rose waveform tracking 30-day repayment velocity.
- **2.6 Dense Priority Debt Ledger ("Action Required Today")**:
  - List of overdue and imminent debts.
  - Friend avatar squircle, loan title, days overdue tag (`Overdue 4 days` in rose pill), formatted amount (`₹2,400`), clock duration, and inline `▷ Send Reminder` spring button.
- **2.7 Contextual Right Inspector Rail (`w-80`)**:
  - **Quick Action Stack**: `Record Loan`, `Request Repayment`, `Export PDF Statement`.
  - **Live Ledger Feed**: Chronological stream of repayments and loan updates (`Rahul repaid ₹500 via UPI 12m ago`).
  - **Top Borrowers Metric**: Leaderboard of friends by balance with repayment health badges.

### Module 3: Loan Creation, Receipt Storage & Validation
- **3.1 Comprehensive Add Loan Modal**:
  - Friend Name (auto-complete from past friends or new contact).
  - Currency Amount with instant formatted commas (`₹15,000`).
  - Due Date with tactile quick-chips (`In 3 days`, `Next week`, `End of month`, `Custom date`).
  - Category selector with animated icons (`🍔 Dining`, `🚗 Travel`, `🏠 Rent`, `⚡ Cash`).
  - Receipt Photo Upload: Drag & drop or camera snapshot, uploaded directly to **Cloudinary CDN**.
  - Optional Note: Context or location of expense.

### Module 4: Repayment & Gentle Reminder Engine
- **4.1 Full & Partial Repayment Drawer**:
  - Sliding drawer allowing the lender to record full or partial repayment with notes.
- **4.2 Zero-Awkwardness Polite Reminder Dispatch**:
  - Generates a courteous WhatsApp message with a direct settlement link and UPI QR.
  - Dispatched via the **central `wa-bridge`** without requiring awkward phone calls.
- **4.3 Receipt Inspection Modal**:
  - High-resolution modal with pan/zoom to inspect attached bill or bill-split receipt.

---

## 🔄 Synchronized Feature SDLC Tracking Matrix

| Feature ID | Feature Name | Spec Status | Content Dictionary | Visual Design Gate | ER Schema Lock | Full-Stack Build | Tri-Axis QA |
|---|---|---|---|---|---|---|---|
| **ML-01** | Phone & Session Auth | ✅ Locked | ✅ Mapped | ⏳ Pending Mesh | ⏳ Pending Schema | ⏳ Queued | ⏳ Queued |
| **ML-02** | 3-Zone Ledger Cockpit | ✅ Locked | ✅ Mapped | ⏳ Pending Mesh | ⏳ Pending Schema | ⏳ Queued | ⏳ Queued |
| **ML-03** | Add Loan & Cloudinary Receipt | ✅ Locked | ✅ Mapped | ⏳ Pending Mesh | ⏳ Pending Schema | ⏳ Queued | ⏳ Queued |
| **ML-04** | Overdue Debt Prioritizer | ✅ Locked | ✅ Mapped | ⏳ Pending Mesh | ⏳ Pending Schema | ⏳ Queued | ⏳ Queued |
| **ML-05** | Polite WhatsApp Reminder Link | ✅ Locked | ✅ Mapped | ⏳ Pending Mesh | ⏳ Pending Schema | ⏳ Queued | ⏳ Queued |
| **ML-06** | Full / Partial Repayment Flow | ✅ Locked | ✅ Mapped | ⏳ Pending Mesh | ⏳ Pending Schema | ⏳ Queued | ⏳ Queued |
| **ML-07** | Dual-Theme Tri-Axis Verification | ✅ Locked | ✅ Mapped | ⏳ Pending Mesh | ⏳ Pending Schema | ⏳ Queued | ⏳ Queued |
