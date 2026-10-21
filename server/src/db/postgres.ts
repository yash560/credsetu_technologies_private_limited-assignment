import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgrespassword@localhost:5432/miniledger';

export const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
});

export async function initPostgresTables() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) DEFAULT 'MiniLedger User',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS otp_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone VARCHAR(20) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS loans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone VARCHAR(20) NOT NULL,
        friend_name VARCHAR(150) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
        due_date DATE NOT NULL,
        is_repaid BOOLEAN DEFAULT FALSE,
        repaid_at TIMESTAMP WITH TIME ZONE,
        notes TEXT,
        receipt_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_loans_phone_due ON loans(phone, due_date, is_repaid);
    `);
    console.log('[POSTGRES] Tables verified and ready.');
  } catch (err) {
    console.warn('[POSTGRES] Connection warning:', (err as Error).message);
  } finally {
    client.release();
  }
}
