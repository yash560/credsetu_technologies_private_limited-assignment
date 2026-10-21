import { NextRequest, NextResponse } from 'next/server';
import { markLoanRepaid } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({ is_repaid: true }));
    const isRepaid = body?.is_repaid !== undefined ? Boolean(body.is_repaid) : true;

    const updated = await markLoanRepaid(id, isRepaid);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Loan with id '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: isRepaid ? 'Loan marked as repaid' : 'Loan marked as active',
      loan: updated,
    });
  } catch (error) {
    console.error('Error updating loan repayment status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
