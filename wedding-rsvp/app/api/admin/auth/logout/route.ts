import { NextRequest, NextResponse } from 'next/server';
import { deleteAdminSession } from '@/lib/admin-otp';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get('admin_session')?.value;

  if (sessionToken) {
    await deleteAdminSession(sessionToken);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_session');
  
  return response;
}