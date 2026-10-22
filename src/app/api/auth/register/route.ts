import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validations';
import { createUser, toUserAccount } from '@/lib/db';
import { hashPassword, signSessionToken } from '@/lib/auth';
import { sendSmtpEmail, renderWelcomeEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password, phone } = parsed.data;

    // Hash password with bcrypt
    const passwordHash = await hashPassword(password);

    // Create user in store
    const user = await createUser({
      name,
      email,
      passwordHash,
      phone,
    });

    // Generate session token
    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
    });

    // Send Welcome Email via SMTP (non-blocking)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://credsetutechnologiesprivatelimited.vercel.app';
    sendSmtpEmail({
      to: user.email,
      subject: `Welcome to MiniLedger, ${user.name}! ✦`,
      html: renderWelcomeEmail({
        name: user.name,
        verifyUrl: `${appUrl}/?verified=true`,
        appName: 'MiniLedger',
      }),
    }).catch((err) => console.error('[REGISTER SMTP ERROR]', err));

    const response = NextResponse.json(
      {
        success: true,
        message: 'Account registered successfully.',
        user: toUserAccount(user),
        token,
      },
      { status: 201 }
    );

    // Set secure HTTP-only cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Server error during registration';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 400 }
    );
  }
}
