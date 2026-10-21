import { NextRequest, NextResponse } from 'next/server';
import { getSummary, normalizePhone } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone') || '+919876543210';

    const summary = await getSummary(phone);

    return NextResponse.json({
      success: true,
      phone: normalizePhone(phone),
      summary: {
        total_lent: summary.total_lent,
        total_repaid: summary.total_repaid,
        overdue_amount: summary.overdue_amount,
        active_amount: summary.active_amount,
        total_loans: summary.total_loans,
        overdue_count: summary.overdue_count,
        active_count: summary.active_count,
        repaid_count: summary.repaid_count,
        repayment_rate_pct: summary.repayment_rate_pct,
      },
      currency: 'INR (₹)',
      calculated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
