import { NextRequest, NextResponse } from 'next/server';
import { deleteLoan } from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deleted = await deleteLoan(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: `Loan with id '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Loan entry deleted successfully',
      id,
    });
  } catch (error) {
    console.error('Error deleting loan:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
