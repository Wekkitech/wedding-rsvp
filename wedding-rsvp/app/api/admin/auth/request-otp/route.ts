import { NextRequest, NextResponse } from 'next/server';
import { createAdminOTP } from '@/lib/admin-otp';
import { sendEmail } from '@/lib/email';
import { isAdmin } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!(await isAdmin(email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const { otp, expiresAt } = await createAdminOTP(email, ipAddress, userAgent);

    try {
      await sendEmail({
        to: email,
        subject: 'Your Admin Login Code - Wedding RSVP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>🔐 Admin Login Code</h2>
            <p>Your one-time code is:</p>
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #8B7355; text-align: center; padding: 20px; background: white; border: 2px dashed #D4A574; border-radius: 8px; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code will expire in <strong>10 minutes</strong></p>
            <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Email error:', emailError);
      
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          message: 'OTP generated (dev mode)',
          otp,
          expiresAt,
        });
      }
      
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent', expiresAt });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}