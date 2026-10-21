-- MiniLedger Production PostgreSQL DDL Schema
-- Designed for Credsetu Technologies Assignment
-- Engine: PostgreSQL 14+ / 17

-- 1. Create Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) DEFAULT 'MiniLedger User',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Mock OTP Sessions Table
CREATE TABLE IF NOT EXISTS otp_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_sessions(phone, expires_at);

-- 4. Loan Entries Table
CREATE TABLE IF NOT EXISTS loans (
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

-- Optimized Performance Indexes for Fast Overdue & Summary Queries
CREATE INDEX IF NOT EXISTS idx_loans_phone_due ON loans(phone, due_date, is_repaid);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(is_repaid);
CREATE INDEX IF NOT EXISTS idx_loans_friend ON loans(phone, friend_name);

-- 5. Stored Procedure / Aggregation View for Summary
CREATE OR REPLACE VIEW v_loan_summary AS
SELECT
    phone,
    COUNT(*) AS total_loans,
    COALESCE(SUM(amount), 0) AS total_lent,
    COALESCE(SUM(CASE WHEN is_repaid = TRUE THEN amount ELSE 0 END), 0) AS total_repaid,
    COALESCE(SUM(CASE WHEN is_repaid = FALSE AND due_date < CURRENT_DATE THEN amount ELSE 0 END), 0) AS overdue_amount,
    COALESCE(SUM(CASE WHEN is_repaid = FALSE THEN amount ELSE 0 END), 0) AS active_amount,
    COUNT(CASE WHEN is_repaid = FALSE AND due_date < CURRENT_DATE THEN 1 END) AS overdue_count,
    COUNT(CASE WHEN is_repaid = FALSE THEN 1 END) AS active_count,
    COUNT(CASE WHEN is_repaid = TRUE THEN 1 END) AS repaid_count
FROM loans
GROUP BY phone;
