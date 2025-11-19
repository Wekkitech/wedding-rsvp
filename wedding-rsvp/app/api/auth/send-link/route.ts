import { createMagicLink, getMagicLinkUrl } from '@/lib/auth';
import { getGuestByEmail } from '@/lib/db';
import { getMagicLinkEmailTemplate } from '@/lib/email-templates';
import { sendEmail } from '@/lib/email';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Check if email exists in guest list
    const invitedGuest = await getGuestByEmail(email);
    
    if (!invitedGuest) {
      return NextResponse.json(
        { 
          error: 'This email is not on our guest list. Please check your email or contact the couple if you believe this is an error.' 
        },
        { status: 403 }
      );
    }

    // Generate magic link token
    const token = await createMagicLink(email);
    const loginUrl = getMagicLinkUrl(token);

    console.log('✅ Magic link for', email, ':', loginUrl);

    // Send email
    try {
      await sendEmail({
        to: email,
        subject: 'Your RSVP Login Link - Brill & Damaris Wedding',
        html: getMagicLinkEmailTemplate(invitedGuest.name || '', loginUrl),
      });

      console.log('✅ Email sent to:', email);
    } catch (emailError: any) {
      console.error('❌ Email send failed:', emailError);
      
      // In development, still return success with link
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({ 
          success: true, 
          message: 'Dev mode: Email not sent but link generated',
          loginUrl 
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Login link sent to your email!',
      // In development, return the link
      ...(process.env.NODE_ENV === 'development' && { loginUrl })
    });
  } catch (error: any) {
    console.error('Error sending magic link:', error);
    return NextResponse.json(
      { error: 'Failed to send login link' },
      { status: 500 }
    );
  }
}