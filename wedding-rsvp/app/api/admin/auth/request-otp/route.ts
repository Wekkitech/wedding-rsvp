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

    // Always log OTP in development
    console.log('🔐 OTP for', email, ':', otp);

    // Try to send email
    try {
      await sendEmail({
        to: email,
        subject: 'Your Admin Login Code - Wedding RSVP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8B7355;">🔐 Admin Login Code</h2>
            <p>Your one-time code is:</p>
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #8B7355; text-align: center; padding: 20px; background: white; border: 2px dashed #D4A574; border-radius: 8px; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code will expire in <strong>10 minutes</strong></p>
            <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">Wedding RSVP Admin Portal</p>
          </div>
        `,
      });

      console.log('✅ Email sent successfully');
    } catch (emailError: any) {
      console.error('⚠️ Email send failed:', emailError.message);
      // Continue anyway - OTP still works
    }


    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email',
      expiresAt,
    });

  } catch (error: any) {
    console.error('💥 Request OTP error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}