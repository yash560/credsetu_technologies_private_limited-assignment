import { NextResponse } from 'next/server';
import { serverLogs } from '@/lib/db';

export async function GET() {
  const logs = serverLogs.getLogs();
  return NextResponse.json({
    success: true,
    logs,
  });
}
