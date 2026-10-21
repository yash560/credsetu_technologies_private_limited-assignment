import { NextRequest, NextResponse } from 'next/server';
import { getLoans, createLoan, normalizePhone } from '@/lib/db';
import { createLoanSchema } from '@/lib/validations';
import { LoanFilter } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone') || '+919876543210';
    const filter = (searchParams.get('filter') || 'all') as LoanFilter;
    const search = searchParams.get('search') || undefined;

    const loans = await getLoans(phone, filter, search);

    return NextResponse.json({
      success: true,
      count: loans.length,
      filter,
      phone: normalizePhone(phone),
      loans,
    });
  } catch (error) {
    console.error('Error fetching loans:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = req.headers.get('x-user-phone') || searchParams.get('phone') || '+919876543210';

    const body = await req.json();
    const parsed = createLoanSchema.safeParse(body);

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

    const newLoan = await createLoan(phone, parsed.data);

    return NextResponse.json(
      {
        success: true,
        message: 'Loan entry created successfully',
        loan: newLoan,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating loan:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
