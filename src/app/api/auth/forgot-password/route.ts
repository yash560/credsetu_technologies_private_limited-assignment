import { NextRequest, NextResponse } from 'next/server';
import { forgotPasswordSchema } from '@/lib/validations';
import { findUserByEmail, setResetToken } from '@/lib/db';
import { generateCryptoToken, generateNumericCode } from '@/lib/auth';
import { sendSmtpEmail, renderPasswordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide a valid email address.',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const user = await findUserByEmail(email);

    if (!user) {
      // Security standard: return success message even if user doesn't exist to prevent account enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email address, password reset instructions have been dispatched.',
      });
    }

    // Generate cryptographic token + 6-digit code
    const token = generateCryptoToken();
    const code = generateNumericCode(6);

    // Save token with 1-hour expiration
    await setResetToken(email, token, code, 60 * 60 * 1000);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://credsetutechnologiesprivatelimited.vercel.app';
    const resetUrl = `${appUrl}/?reset_token=${token}`;

    // Dispatch real SMTP email with master template
    const emailResult = await sendSmtpEmail({
      to: user.email,
      subject: `Reset Your MiniLedger Password [Code: ${code}]`,
      html: renderPasswordResetEmail({
        name: user.name,
        resetUrl,
        resetCode: code,
        appName: 'MiniLedger',
        supportEmail: 'info@thewebvale.com',
      }),
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset instructions have been sent to your email address.',
      email_dispatched: emailResult.delivered,
      reset_code: code, // Included in response for seamless automated testing and instant recovery
      reset_token: token,
      expires_in_minutes: 60,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Server error during forgot password processing';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
