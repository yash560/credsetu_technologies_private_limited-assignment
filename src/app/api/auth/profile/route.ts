import { NextRequest, NextResponse } from 'next/server';
import { getAuthSessionFromRequest, verifyPassword, hashPassword } from '@/lib/auth';
import { findUserById, updateUserProfile, toUserAccount } from '@/lib/db';
import { changePasswordSchema, updateProfileSchema } from '@/lib/validations';

export async function PATCH(req: NextRequest) {
  try {
    const session = getAuthSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await updateUserProfile(session.userId, parsed.data);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      user: toUserAccount(updated),
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAuthSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const user = await findUserById(session.userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const isMatch = await verifyPassword(parsed.data.current_password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Current password is incorrect.' }, { status: 400 });
    }

    const newHash = await hashPassword(parsed.data.new_password);
    await updateUserProfile(session.userId, { passwordHash: newHash });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
