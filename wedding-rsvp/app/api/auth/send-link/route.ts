import { createMagicLink, getMagicLinkUrl } from '@/lib/auth';
import { createOrUpdateGuest, getGuestByEmail } from '@/lib/db';
import { getMagicLinkEmailTemplate } from '@/lib/email-templates';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

 // INVITE-ONLY SYSTEM: Check if email is invited
    // Only pre-invited guests in the database can request a magic link
    const invitedGuest = await getGuestByEmail(email);
    
    if (!invitedGuest) {
      return NextResponse.json(
        { 
          error: 'This email is not on our guest list. Please check your email or contact the couple if you believe this is an error.' 
        },
        { status: 403 }
      );
    }

    // Update guest info if provided
    if (name) {
      await createOrUpdateGuest(email, { name });
    }

    // Generate magic link token
    const token = await createMagicLink(email);
    const loginUrl = getMagicLinkUrl(token);

    // In production, you would send this via Resend/SendGrid
    // For now, we'll return the URL (you can log it in development)
    console.log('Magic link for', email, ':', loginUrl);

    // TODO: Uncomment when you have Resend API key
    /*
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: 'wedding@brilldamaris.com',
      to: email,
      subject: 'Your RSVP Login Link - Brill & Damaris Wedding',
      html: getMagicLinkEmailTemplate(name || '', loginUrl),
    });
    */

    return NextResponse.json({ 
      success: true, 
      message: 'Login link sent to your email!',
      // In development, return the link
      ...(process.env.NODE_ENV === 'development' && { loginUrl })
    });
  } catch (error) {
    console.error('Error sending magic link:', error);
    return NextResponse.json(
      { error: 'Failed to send login link' },
      { status: 500 }
    );
  }
}
