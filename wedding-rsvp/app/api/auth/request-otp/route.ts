// app/api/admin/auth/request-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminOTP } from '@/lib/admin-otp';
import { sendEmail } from '@/lib/email';
import { isAdmin } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Verify email is admin
    if (!(await isAdmin(email))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get IP and User Agent for security
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create OTP
    const { otp, expiresAt } = await createAdminOTP(email, ipAddress, userAgent);

    // Send OTP via email
    try {
      await sendEmail({
        to: email,
        subject: 'Your Admin Login Code - Brill & Damaris Wedding',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #8B7355 0%, #D4A574 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .otp-code { 
                font-size: 36px; 
                font-weight: bold; 
                letter-spacing: 8px; 
                color: #8B7355; 
                text-align: center; 
                padding: 20px; 
                background: white; 
                border: 2px dashed #D4A574; 
                border-radius: 8px; 
                margin: 20px 0;
              }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Admin Login Code</h1>
              </div>
              <div class="content">
                <p>Hello Admin,</p>
                
                <p>You requested access to the Wedding RSVP admin dashboard. Here's your one-time code:</p>
                
                <div class="otp-code">${otp}</div>
                
                <p style="text-align: center; color: #666; font-size: 14px;">
                  This code will expire in <strong>10 minutes</strong>
                </p>
                
                <div class="warning">
                  <strong>⚠️ Security Notice:</strong>
                  <ul style="margin: 10px 0;">
                    <li>Never share this code with anyone</li>
                    <li>We will never ask for this code via phone or text</li>
                    <li>This code expires at ${expiresAt.toLocaleTimeString()}</li>
                    <li>Maximum 5 attempts allowed</li>
                  </ul>
                </div>
                
                <p>If you didn't request this code, please ignore this email and ensure your admin email is secure.</p>
                
                <p style="margin-top: 30px;">
                  <strong>Wedding RSVP System</strong><br>
                  Brill & Damaris Wedding
                </p>
              </div>
              <div class="footer">
                <p>This is an automated security email. Please do not reply.</p>
                <p>Request from IP: ${ipAddress}</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      
      // In development, return OTP directly for testing
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          message: 'OTP generated (dev mode)',
          otp, // Only in dev!
          expiresAt,
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email',
      expiresAt,
    });
  } catch (error) {
    console.error('Error in request-otp:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}