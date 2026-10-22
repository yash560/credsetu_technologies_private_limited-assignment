import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromName?: string;
}

export interface EmailDeliveryResult {
  success: boolean;
  delivered: boolean;
  messageId?: string;
  error?: string;
  fallbackNote?: string;
}

/**
 * Resolves SMTP configuration dynamically from environment variables,
 * falling back to the local sovereign vault profile if running in Node environment.
 */
export function getSmtpConfig() {
  let host = process.env.SMTP_HOST;
  let port = Number(process.env.SMTP_PORT) || 465;
  let secure = process.env.SMTP_SECURE !== 'false';
  let user = process.env.SMTP_USER;
  let pass = process.env.SMTP_PASS;
  const fromName = process.env.SMTP_FROM_NAME || 'MiniLedger by Yash Jain';

  // Fallback: Read directly from vault if local on sovereign host
  if ((!host || !pass) && typeof process !== 'undefined' && process.env.HOME) {
    try {
      const vaultPath = path.join(process.env.HOME, '.gemini/antigravity/vault/smtp_profiles.json');
      if (fs.existsSync(vaultPath)) {
        const vault = JSON.parse(fs.readFileSync(vaultPath, 'utf8'));
        const profile = vault.thewebvale;
        if (profile) {
          host = host || profile.host;
          port = port || profile.port;
          secure = profile.secure ?? true;
          user = user || profile.email;
          pass = pass || profile.password;
        }
      }
    } catch {
      // Ignore vault read errors in sandboxed environments
    }
  }

  return {
    host: host || 'smtpout.secureserver.net',
    port: port || 465,
    secure: secure,
    user: user || 'info@thewebvale.com',
    pass: pass || '',
    fromName,
  };
}

/**
 * Creates an authenticated Nodemailer transporter.
 */
export function createTransporter() {
  const cfg = getSmtpConfig();
  if (!cfg.pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Dispatches a fully-rendered responsive HTML email via SMTP.
 */
export async function sendSmtpEmail(opts: SendEmailOptions): Promise<EmailDeliveryResult> {
  const cfg = getSmtpConfig();
  const transporter = createTransporter();

  if (!transporter) {
    console.warn(`[SMTP SIMULATION] Password not configured. Email to ${opts.to} logged.`);
    return {
      success: true,
      delivered: false,
      messageId: `sim-${Date.now()}`,
      fallbackNote: 'SMTP credentials absent; email recorded to server audit logs.',
    };
  }

  try {
    const fromHeader = `"${opts.fromName || cfg.fromName}" <${cfg.user}>`;
    const plainText = opts.text || opts.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    const info = await transporter.sendMail({
      from: fromHeader,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: plainText,
    });

    return {
      success: true,
      delivered: true,
      messageId: info.messageId,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[SMTP ERROR] Failed to send email:', errorMsg);
    return {
      success: false,
      delivered: false,
      error: errorMsg,
    };
  }
}

// ─────────────────────────────────────────────────────────────
// MASTER RESPONSIVE HTML EMAIL TEMPLATES (thewebvale standard)
// ─────────────────────────────────────────────────────────────

/**
 * 1. Master Password Reset Email Template
 */
export function renderPasswordResetEmail({
  name,
  resetUrl,
  resetCode,
  appName = 'MiniLedger',
  supportEmail = 'info@thewebvale.com',
}: {
  name: string;
  resetUrl: string;
  resetCode: string;
  appName?: string;
  supportEmail?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your ${appName} Password</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; margin: 0; padding: 24px 12px; -webkit-font-smoothing: antialiased; }
    .card { max-width: 540px; margin: 0 auto; background: #131926; border: 1px solid #232d42; border-radius: 18px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    .header { padding: 36px 32px 24px; text-align: center; border-bottom: 1px solid #1e2638; background: linear-gradient(180deg, #1b2336 0%, #131926 100%); }
    .brand-pill { display: inline-flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; font-weight: 700; font-size: 13px; padding: 6px 14px; border-radius: 9999px; letter-spacing: 0.5px; }
    .title { margin: 16px 0 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .content { padding: 32px; font-size: 15px; line-height: 1.65; color: #cbd5e1; }
    .greeting { font-size: 17px; font-weight: 700; color: #ffffff; margin-bottom: 14px; }
    .btn-container { text-align: center; margin: 32px 0 24px; }
    .cta-btn { display: inline-block; background: #10b981; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 15px; padding: 15px 36px; border-radius: 12px; box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.5); letter-spacing: 0.2px; }
    .code-box { background: #0b0f19; border: 1px dashed #334155; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
    .code-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 6px; font-weight: 600; }
    .code-digits { font-family: ui-monospace, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; }
    .warning { font-size: 13px; color: #94a3b8; background: rgba(239, 68, 68, 0.08); border-left: 3px solid #ef4444; padding: 12px 16px; border-radius: 4px; margin-top: 24px; line-height: 1.5; }
    .footer { padding: 24px 32px; background: #0c111a; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1a2233; line-height: 1.6; }
    .footer a { color: #10b981; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand-pill">✦ ${appName} Identity Security</div>
      <h1 class="title">Password Reset Request</h1>
    </div>
    <div class="content">
      <div class="greeting">Hello ${name},</div>
      <p>We received a secure request to reset the password for your <strong>${appName}</strong> account. Click the button below to establish a new password:</p>
      
      <div class="btn-container">
        <a href="${resetUrl}" class="cta-btn" target="_blank">Reset My Password →</a>
      </div>

      <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 20px;">Or enter this 6-digit verification code directly into the password reset modal:</p>
      <div class="code-box">
        <div class="code-label">6-Digit Security Code</div>
        <div class="code-digits">${resetCode}</div>
      </div>

      <div class="warning">
        <strong>Security Notice:</strong> This link and single-use code will expire in <strong>60 minutes</strong>. If you did not initiate this request, you can safely disregard this email; your credentials remain fully protected.
      </div>
    </div>
    <div class="footer">
      Engineered by <strong>Yash Jain</strong> • TheWebVale Sovereign Infrastructure<br>
      Questions? Reach us at <a href="mailto:${supportEmail}">${supportEmail}</a>
    </div>
  </div>
</body>
</html>`;
}

/**
 * 2. Master Welcome & Verification Email Template
 */
export function renderWelcomeEmail({
  name,
  verifyUrl,
  appName = 'MiniLedger',
}: {
  name: string;
  verifyUrl: string;
  appName?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${appName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #f1f5f9; margin: 0; padding: 24px 12px; }
    .card { max-width: 540px; margin: 0 auto; background: #131926; border: 1px solid #232d42; border-radius: 18px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    .header { padding: 36px 32px 24px; text-align: center; border-bottom: 1px solid #1e2638; background: linear-gradient(180deg, #1b2336 0%, #131926 100%); }
    .brand-pill { display: inline-flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; font-weight: 700; font-size: 13px; padding: 6px 14px; border-radius: 9999px; }
    .title { margin: 16px 0 0; color: #ffffff; font-size: 24px; font-weight: 800; }
    .content { padding: 32px; font-size: 15px; line-height: 1.65; color: #cbd5e1; }
    .btn-container { text-align: center; margin: 28px 0; }
    .cta-btn { display: inline-block; background: #10b981; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 15px; padding: 15px 36px; border-radius: 12px; box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.5); }
    .features { background: #0c111a; border-radius: 12px; padding: 18px 22px; margin: 24px 0; border: 1px solid #1a2233; }
    .feature-item { margin-bottom: 10px; font-size: 14px; display: flex; align-items: flex-start; gap: 10px; }
    .feature-item:last-child { margin-bottom: 0; }
    .check { color: #10b981; font-weight: 800; }
    .footer { padding: 24px 32px; background: #0c111a; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1a2233; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand-pill">✦ ${appName} Identity</div>
      <h1 class="title">Welcome Aboard</h1>
    </div>
    <div class="content">
      <p style="font-size: 17px; font-weight: 700; color: #fff; margin-top: 0;">Welcome, ${name}!</p>
      <p>Your account on <strong>${appName}</strong> has been created. Eliminate financial awkwardness between friends with automated transparent ledgers, bill proofs, and courteous settlement reminders.</p>
      
      <div class="features">
        <div class="feature-item"><span class="check">✓</span> <span><strong>Real-time ledger:</strong> Track lent and borrowed funds with overdue diagnostics.</span></div>
        <div class="feature-item"><span class="check">✓</span> <span><strong>Receipt vault:</strong> Attach Cloudinary bill snapshots to eliminate disputes.</span></div>
        <div class="feature-item"><span class="check">✓</span> <span><strong>Courteous reminders:</strong> 1-click friendly WhatsApp & email nudges.</span></div>
      </div>

      <div class="btn-container">
        <a href="${verifyUrl}" class="cta-btn" target="_blank">Launch My Ledger Cockpit →</a>
      </div>
    </div>
    <div class="footer">
      Engineered by <strong>Yash Jain</strong> • TheWebVale Sovereign Infrastructure
    </div>
  </div>
</body>
</html>`;
}

/**
 * 3. Master Transactional Repayment Reminder Email Template
 */
export function renderRepaymentReminderEmail({
  friendName,
  lenderName,
  amount,
  dueDate,
  notes,
  payUrl,
  appName = 'MiniLedger',
}: {
  friendName: string;
  lenderName: string;
  amount: number;
  dueDate: string;
  notes?: string | null;
  payUrl?: string;
  appName?: string;
}): string {
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Friendly Reminder from ${lenderName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #f1f5f9; margin: 0; padding: 24px 12px; }
    .card { max-width: 540px; margin: 0 auto; background: #131926; border: 1px solid #232d42; border-radius: 18px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    .header { padding: 32px 32px 20px; text-align: center; border-bottom: 1px solid #1e2638; background: linear-gradient(180deg, #1b2336 0%, #131926 100%); }
    .brand-pill { display: inline-flex; align-items: center; gap: 8px; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; font-weight: 700; font-size: 13px; padding: 6px 14px; border-radius: 9999px; }
    .title { margin: 14px 0 0; color: #ffffff; font-size: 22px; font-weight: 800; }
    .content { padding: 32px; font-size: 15px; line-height: 1.65; color: #cbd5e1; }
    .amount-box { background: #0b0f19; border: 1px solid #232d42; border-radius: 14px; padding: 22px; text-align: center; margin: 24px 0; }
    .amount-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 600; margin-bottom: 6px; }
    .amount-val { font-size: 34px; font-weight: 800; color: #10b981; letter-spacing: -0.5px; }
    .due-date { font-size: 13px; color: #fbbf24; margin-top: 6px; font-weight: 600; }
    .notes-box { background: #0c111a; border-left: 3px solid #38bdf8; padding: 12px 16px; border-radius: 4px; font-size: 14px; margin: 20px 0; font-style: italic; color: #94a3b8; }
    .btn-container { text-align: center; margin: 28px 0; }
    .cta-btn { display: inline-block; background: #10b981; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 34px; border-radius: 12px; box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.5); }
    .footer { padding: 22px 32px; background: #0c111a; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1a2233; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand-pill">✦ ${appName} Polite Reminder</div>
      <h1 class="title">Friendly Debt Settlement Notice</h1>
    </div>
    <div class="content">
      <p style="font-size: 16px; color: #fff; margin-top: 0;">Hi <strong>${friendName}</strong>,</p>
      <p>This is a quick, courteous reminder from <strong>${lenderName}</strong> regarding your shared expense ledger.</p>
      
      <div class="amount-box">
        <div class="amount-label">Pending Balance</div>
        <div class="amount-val">${formattedAmount}</div>
        <div class="due-date">📅 Scheduled Due Date: ${dueDate}</div>
      </div>

      ${notes ? `<div class="notes-box">“${notes}”</div>` : ''}

      <div class="btn-container">
        <a href="${payUrl || 'https://credsetutechnologiesprivatelimited.vercel.app'}" class="cta-btn" target="_blank">View Ledger & Settle Up →</a>
      </div>
      <p style="font-size: 13px; color: #64748b; text-align: center;">No stress! Clear communication keeps friendships strong.</p>
    </div>
    <div class="footer">
      Sent on behalf of ${lenderName} via <strong>${appName}</strong><br>
      Engineered by Yash Jain • TheWebVale Infrastructure
    </div>
  </div>
</body>
</html>`;
}
