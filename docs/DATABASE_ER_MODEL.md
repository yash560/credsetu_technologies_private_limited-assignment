# 🗄️ DATABASE ENTITY-RELATIONSHIP (ER) MODEL: MiniLedger
Domain: Personal Micro-Lending (Credsetu Technologies)
Author: Pre-Backend Architecture & Database Specialist

---

## 🏛️ Visual Entity-Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ FRIEND : manages
    USER ||--o{ LOAN : records
    USER ||--o{ AUDIT_LOG : generates
    FRIEND ||--o{ LOAN : borrows
    LOAN ||--o{ REPAYMENT : receives

    USER {
        string id PK "cuid/uuid"
        string phone UK "10-digit mobile"
        string name "User display name"
        string email "Optional email"
        string avatarUrl "Cloudinary avatar"
        datetime createdAt "Audit timestamp"
        datetime updatedAt "Audit timestamp"
    }

    FRIEND {
        string id PK "cuid/uuid"
        string userId FK "References USER.id"
        string name "Friend full name"
        string phone "Friend phone number"
        decimal totalLent "Aggregate sum lent"
        decimal totalRepaid "Aggregate sum returned"
        decimal netBalance "Current pending balance"
        datetime createdAt "Audit timestamp"
        datetime updatedAt "Audit timestamp"
    }

    LOAN {
        string id PK "cuid/uuid"
        string userId FK "References USER.id"
        string friendId FK "References FRIEND.id"
        string title "Expense title (e.g. Goa Villa)"
        decimal amount "Remaining uncollected amount"
        decimal originalAmount "Original amount lent"
        string category "DINING | TRAVEL | RENT | CASH | BILLS"
        date dueDate "Promised repayment date"
        boolean isRepaid "Settlement flag"
        datetime repaidAt "Timestamp of full settlement"
        string note "Optional context note"
        string receiptUrl "Cloudinary CDN signed image URL"
        int reminderCount "Number of reminders sent"
        datetime lastReminderAt "Timestamp of last WhatsApp ping"
        datetime createdAt "Audit timestamp"
        datetime updatedAt "Audit timestamp"
    }

    REPAYMENT {
        string id PK "cuid/uuid"
        string loanId FK "References LOAN.id"
        string userId FK "References USER.id"
        decimal amount "Amount repaid in this tranche"
        string method "UPI | CASH | NETBANKING"
        string note "Payment reference / UTR"
        string receiptUrl "Cloudinary proof screenshot"
        datetime settledAt "Timestamp of payment"
        datetime createdAt "Audit timestamp"
    }

    AUDIT_LOG {
        string id PK "cuid/uuid"
        string userId FK "References USER.id"
        string action "LOAN_CREATED | REMINDER_SENT | REPAID"
        string details "JSON metadata payload"
        string ipAddress "Client IP"
        datetime createdAt "Audit timestamp"
    }
```

---

## 🔒 Relational Integrity & Indexing Invariants
1. **Compound Indexes**:
   - `LOAN`: `[userId, isRepaid, dueDate]` (Fast query for overdue / active dashboard items).
   - `FRIEND`: `[userId, name]` (Autocomplete friend search).
   - `REPAYMENT`: `[loanId, settledAt]` (Chronological repayment history).
2. **Zero In-Memory Mocking**:
   - Backed by real MongoDB Atlas / PostgreSQL cluster.
   - All mutations execute with strict ACID transactions to ensure `FRIEND.netBalance` and `LOAN.amount` stay perfectly reconciled.
3. **Receipt Cloudinary Isolation**:
   - `receiptUrl` stores signed Cloudinary CDN URLs (`https://res.cloudinary.com/thewebvale/...`). Zero local disk bloat.
