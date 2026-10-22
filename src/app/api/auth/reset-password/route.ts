import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordSchema } from '@/lib/validations';
import { verifyAndResetPassword, toUserAccount } from '@/lib/db';
import { hashPassword, signSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

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

    const { token, new_password } = parsed.data;

    // Hash the new password with bcrypt
    const newPasswordHash = await hashPassword(new_password);

    // Verify token or 6-digit code and update password
    const result = await verifyAndResetPassword(token, newPasswordHash);

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error || 'Invalid or expired password reset token.' },
        { status: 400 }
      );
    }

    // Auto-login user with new session token
    const sessionToken = signSessionToken({
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      phone: result.user.phone,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Password successfully updated. You are now logged in.',
      user: toUserAccount(result.user),
      token: sessionToken,
    });

    response.cookies.set('auth_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Server error during password reset';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
