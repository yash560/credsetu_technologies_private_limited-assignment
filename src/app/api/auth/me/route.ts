import { NextRequest, NextResponse } from 'next/server';
import { getAuthSessionFromRequest } from '@/lib/auth';
import { findUserById, toUserAccount, getSummary } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = getAuthSessionFromRequest(req);

    if (!session) {
      return NextResponse.json(
        { success: false, authenticated: false, user: null },
        { status: 200 }
      );
    }

    const user = await findUserById(session.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User record not found.' },
        { status: 404 }
      );
    }

    const summary = await getSummary(user.phone || undefined, user.id);

    return NextResponse.json({
      success: true,
      user: toUserAccount(user),
      summary,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Server error fetching session';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
