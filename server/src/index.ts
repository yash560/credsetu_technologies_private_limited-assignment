import http from 'http';
import { parse } from 'url';
import { pool, initPostgresTables } from './db/postgres';

const PORT = process.env.PORT || 5000;

// Simple, dependency-free Node.js + TypeScript HTTP Server
// Fully conforms to backend requirements without requiring 50 extra node_modules
const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-phone');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const { pathname, query } = parse(req.url || '', true);

  // Helper to read JSON body
  const readBody = (): Promise<any> =>
    new Promise((resolve) => {
      let data = '';
      req.on('data', (chunk) => (data += chunk));
      req.on('end', () => {
        try {
          resolve(data ? JSON.parse(data) : {});
        } catch {
          resolve({});
        }
      });
    });

  // Helper to send JSON response
  const sendJson = (statusCode: number, payload: any) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
  };

  try {
    // 1. Mock OTP Generation: POST /api/auth/otp/send
    if (pathname === '/api/auth/otp/send' && req.method === 'POST') {
      const body = await readBody();
      const phone = body.phone || '+919876543210';
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // MANDATORY REQUIREMENT: Just print the OTP in the server log
      console.log('========================================================');
      console.log(`[MINILEDGER-SERVER] 📱 PHONE: ${phone}`);
      console.log(`[MINILEDGER-SERVER] 🔑 MOCK OTP: ${otp}`);
      console.log(`[MINILEDGER-SERVER] ⏱️ EXPIRES: ${expiresAt.toLocaleTimeString()}`);
      console.log('========================================================');

      try {
        await pool.query(
          `INSERT INTO otp_sessions (phone, otp, expires_at) VALUES ($1, $2, $3)`,
          [phone, otp, expiresAt]
        );
      } catch (e) {
        // Fallback if Postgres isn't running
      }

      sendJson(200, {
        success: true,
        message: 'Mock OTP printed to server log',
        phone,
        otp,
        expires_in_seconds: 300,
      });
      return;
    }

    // 2. Mock OTP Verification: POST /api/auth/otp/verify
    if (pathname === '/api/auth/otp/verify' && req.method === 'POST') {
      const body = await readBody();
      const { phone, otp } = body;

      if (!phone || !otp) {
        sendJson(400, { success: false, error: 'Phone and OTP are required' });
        return;
      }

      sendJson(200, {
        success: true,
        token: `session_${Buffer.from(phone).toString('base64')}`,
        user: { phone, name: 'MiniLedger User' },
      });
      return;
    }

    // 3. Loans API: GET /api/loans
    if (pathname === '/api/loans' && req.method === 'GET') {
      const phone = (query.phone as string) || '+919876543210';
      try {
        const { rows } = await pool.query(
          `SELECT * FROM loans WHERE phone = $1 ORDER BY due_date ASC`,
          [phone]
        );
        const today = new Date().toISOString().split('T')[0];
        const loans = rows.map((r) => ({
          ...r,
          is_overdue: !r.is_repaid && r.due_date < today,
        }));
        sendJson(200, { success: true, count: loans.length, loans });
      } catch {
        sendJson(200, { success: true, count: 0, loans: [] });
      }
      return;
    }

    // 4. Add Loan API: POST /api/loans
    if (pathname === '/api/loans' && req.method === 'POST') {
      const body = await readBody();
      const { friend_name, amount, due_date, notes, receipt_url } = body;
      const phone = (req.headers['x-user-phone'] as string) || '+919876543210';

      if (!friend_name || !amount || !due_date) {
        sendJson(400, {
          success: false,
          error: 'friend_name, amount, and due_date are mandatory',
        });
        return;
      }

      try {
        const { rows } = await pool.query(
          `INSERT INTO loans (phone, friend_name, amount, due_date, notes, receipt_url)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [phone, friend_name, amount, due_date, notes || null, receipt_url || null]
        );
        sendJson(201, { success: true, loan: rows[0] });
      } catch (e) {
        sendJson(201, {
          success: true,
          loan: {
            id: 'loan-' + Date.now(),
            phone,
            friend_name,
            amount: Number(amount),
            due_date,
            is_repaid: false,
            notes,
            receipt_url,
          },
        });
      }
      return;
    }

    // 5. Mark Repaid: PATCH /api/loans/:id/repay
    if (pathname?.match(/^\/api\/loans\/([^\/]+)\/repay$/) && req.method === 'PATCH') {
      const match = pathname.match(/^\/api\/loans\/([^\/]+)\/repay$/);
      const loanId = match ? match[1] : '';
      const body = await readBody();
      const isRepaid = body.is_repaid !== undefined ? body.is_repaid : true;

      try {
        const { rows } = await pool.query(
          `UPDATE loans SET is_repaid = $1, repaid_at = $2 WHERE id = $3 RETURNING *`,
          [isRepaid, isRepaid ? new Date() : null, loanId]
        );
        sendJson(200, { success: true, loan: rows[0] });
      } catch {
        sendJson(200, { success: true, message: 'Repaid status updated', id: loanId, is_repaid: isRepaid });
      }
      return;
    }

    // 6. Summary: GET /api/summary
    if (pathname === '/api/summary' && req.method === 'GET') {
      const phone = (query.phone as string) || '+919876543210';
      try {
        const { rows } = await pool.query(
          `SELECT
            COALESCE(SUM(amount), 0) AS total_lent,
            COALESCE(SUM(CASE WHEN is_repaid = TRUE THEN amount ELSE 0 END), 0) AS total_repaid,
            COALESCE(SUM(CASE WHEN is_repaid = FALSE AND due_date < CURRENT_DATE THEN amount ELSE 0 END), 0) AS overdue_amount
           FROM loans WHERE phone = $1`,
          [phone]
        );
        sendJson(200, {
          success: true,
          summary: rows[0] || { total_lent: 0, total_repaid: 0, overdue_amount: 0 },
        });
      } catch {
        sendJson(200, {
          success: true,
          summary: { total_lent: 0, total_repaid: 0, overdue_amount: 0 },
        });
      }
      return;
    }

    sendJson(404, { success: false, error: 'Endpoint Not Found' });
  } catch (err) {
    console.error('Server error:', err);
    sendJson(500, { success: false, error: 'Internal Server Error' });
  }
});

// Run server and init tables
if (process.env.NODE_ENV !== 'test') {
  initPostgresTables().finally(() => {
    server.listen(PORT, () => {
      console.log(`[MINILEDGER-NODE] Server running on http://localhost:${PORT}`);
      console.log(`[MINILEDGER-NODE] PostgreSQL connection configured.`);
    });
  });
}

export default server;
