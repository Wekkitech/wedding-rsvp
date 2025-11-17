import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminOTP, createAdminSession } from '@/lib/admin-otp';
import { isAdmin } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 });
    }

    if (!(await isAdmin(email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { valid, error: verifyError } = await verifyAdminOTP(email, otp);

    if (!valid) {
      return NextResponse.json({ error: verifyError || 'Invalid OTP' }, { status: 401 });
    }

    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const { sessionToken, expiresAt, role } = await createAdminSession(email, ipAddress, userAgent);

    const response = NextResponse.json({ 
      success: true, 
      message: 'Login successful', 
      expiresAt,
      role // ADD THIS LINE - return role in response
    });

    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}