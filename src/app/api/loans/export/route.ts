import { NextRequest, NextResponse } from 'next/server';
import { getLoans } from '@/lib/db';
import { getAuthSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session = getAuthSessionFromRequest(req);
    const phone = searchParams.get('phone') || session?.phone || '+919876543210';
    const userId = session?.userId;

    const loans = await getLoans(phone, 'all', undefined, userId);

    // Build CSV headers and rows
    const headers = ['ID', 'Friend Name', 'Phone', 'Amount (INR)', 'Category', 'Due Date', 'Status', 'Days Overdue', 'Settled At', 'Notes', 'Receipt URL', 'Created At'];
    
    const rows = loans.map((l) => [
      l.id,
      `"${l.friend_name.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      l.amount,
      l.category || 'general',
      l.due_date,
      l.is_repaid ? 'REPAID' : l.is_overdue ? 'OVERDUE' : 'ACTIVE',
      l.days_overdue || 0,
      l.repaid_at || '',
      `"${(l.notes || '').replace(/"/g, '""')}"`,
      l.receipt_url || '',
      l.created_at,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="miniledger_statement_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Error exporting statement';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
