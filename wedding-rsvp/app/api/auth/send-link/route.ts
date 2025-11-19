import { createMagicLink, getMagicLinkUrl } from '@/lib/auth';
import { getGuestByEmail } from '@/lib/db';
import { getMagicLinkEmailTemplate } from '@/lib/email-templates';
import { sendEmail } from '@/lib/email';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    console.log('📧 Send link request for:', email, 'Name:', name);

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

    console.log('🔗 Magic link generated for', email);
    console.log('🔗 URL:', loginUrl);

    // Get the name (from request or from database)
    const guestName = name || invitedGuest.name || 'Guest';

    // Generate email HTML
    const emailHtml = getMagicLinkEmailTemplate(guestName, loginUrl);

    console.log('📝 Email template generated, length:', emailHtml.length);

    // Send email
    try {
      await sendEmail({
        to: email,
        subject: 'Your RSVP Login Link - Brill & Damaris Wedding',
        html: emailHtml,
      });

      console.log('✅ Email sent successfully to:', email);

      return NextResponse.json({ 
        success: true, 
        message: 'Login link sent to your email!',
        // In development, also return the link
        ...(process.env.NODE_ENV === 'development' && { loginUrl })
      });

    } catch (emailError: any) {
      console.error('❌ Email send failed:', emailError);
      
      // In development, still return success with link
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({ 
          success: true, 
          message: 'Dev mode: Email not sent but link generated',
          loginUrl,
          error: emailError.message
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to send email. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ Send link error:', error);
    return NextResponse.json(
      { error: 'Failed to send login link', details: error.message },
      { status: 500 }
    );
  }
}