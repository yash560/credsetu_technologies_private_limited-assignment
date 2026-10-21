import { NextRequest, NextResponse } from 'next/server';
import { generateMockOtp } from '@/lib/db';
import { sendOtpSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = sendOtpSchema.safeParse(body);

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

    const { phone } = parsed.data;
    const otp = await generateMockOtp(phone);

    return NextResponse.json({
      success: true,
      message: `Mock OTP generated and printed to server console for ${phone}`,
      phone,
      otp, // Included for seamless automated testing and demo convenience
      expires_in_seconds: 300,
    });
  } catch (error) {
    console.error('Error generating mock OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
