import { NextRequest, NextResponse } from 'next/server';
import { verifyMockOtp, normalizePhone } from '@/lib/db';
import { verifyOtpSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { phone, otp } = parsed.data;
    const isValid = await verifyMockOtp(phone, otp);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired OTP. Please check server logs for the generated OTP.',
        },
        { status: 401 }
      );
    }

    const normalized = normalizePhone(phone);
    const token = `ml_session_${Buffer.from(`${normalized}:${Date.now()}`).toString('base64')}`;

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        phone: normalized,
        name: 'MiniLedger User',
        verified: true,
      },
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
