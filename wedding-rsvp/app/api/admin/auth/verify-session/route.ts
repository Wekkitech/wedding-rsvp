import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-otp';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('admin_session')?.value;

  if (!sessionToken) {
    return NextResponse.json({ valid: false });
  }

  const { valid, email, role } = await verifyAdminSession(sessionToken);

  console.log('Verify session result:', { valid, email, role }); // Debug log

  return NextResponse.json({ valid, email, role });
}