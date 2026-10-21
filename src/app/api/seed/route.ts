import { NextRequest, NextResponse } from 'next/server';
import { resetSampleData, normalizePhone } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const phone = body?.phone || searchParams.get('phone') || '+919876543210';

    resetSampleData(phone);

    return NextResponse.json({
      success: true,
      message: `Database re-seeded with realistic ledger loans for ${normalizePhone(phone)}`,
      phone: normalizePhone(phone),
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
