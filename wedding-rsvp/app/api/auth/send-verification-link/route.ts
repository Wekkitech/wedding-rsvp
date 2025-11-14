// app/api/auth/send-verification-link/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createMagicLink } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
export const dynamic = 'force-dynamic';


export async function POST(request: Request) {
  try {
    const { phone, email, name } = await request.json();

    if (!phone || !email) {
      return NextResponse.json(
        { error: 'Phone and email are required' },
        { status: 400 }
      );
    }

    // Verify this phone/email combination exists in our database
    const { data: guest, error: guestError } = await supabaseAdmin
      .from('guests')
      .select('*')
      .eq('phone', phone)
      .eq('email', email)
      .single();

    if (guestError || !guest) {
      return NextResponse.json(
        { error: 'No matching RSVP found for this phone and email combination' },
        { status: 404 }
      );
    }

    // Create magic link token
    const token = await createMagicLink(email);
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify-rsvp?token=${token}`;

    // Send email with verification link
    try {
      await sendEmail({
        to: email,
        subject: 'Verify Your RSVP - Brill & Damaris Wedding',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #8B7355 0%, #D4A574 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 15px 30px; background: #8B7355; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔒 Verify Your RSVP</h1>
              </div>
              <div class="content">
                <p>Hi ${name || 'there'}!</p>
                
                <p>You requested access to view and manage your RSVP for our wedding.</p>
                
                <p>For your security, please click the button below to verify your identity:</p>
                
                <div style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Verify & Access My RSVP</a>
                </div>
                
                <p style="font-size: 14px; color: #666;">
                  Or copy and paste this link into your browser:<br>
                  <a href="${verificationUrl}">${verificationUrl}</a>
                </p>
                
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                  <strong>⚠️ Security Notice:</strong>
                  <ul style="margin: 10px 0;">
                    <li>This link will expire in 24 hours</li>
                    <li>Only use this link if you requested it</li>
                    <li>Your RSVP details are protected by this verification</li>
                  </ul>
                </div>
                
                <p>If you didn't request this email, you can safely ignore it.</p>
                
                <p>We can't wait to celebrate with you!</p>
                <p style="margin-top: 30px;">
                  With love,<br>
                  <strong>Brill & Damaris</strong> 💕
                </p>
              </div>
              <div class="footer">
                <p>Brill & Damaris Wedding | January 23, 2026 | Rusinga Island Lodge</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      
      // In development, return the link directly
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          message: 'Email service not configured - development mode',
          verificationUrl, // Return URL in development for testing
        });
      }
      
      throw emailError;
    }

    return NextResponse.json({
      success: true,
      message: 'Verification link sent to email'
    });
  } catch (error) {
    console.error('Error sending verification link:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
