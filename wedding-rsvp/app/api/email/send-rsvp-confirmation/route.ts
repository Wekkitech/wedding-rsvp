// app/api/email/send-rsvp-confirmation/route.ts
import { sendEmail } from '@/lib/email';
import { getRSVPConfirmationEmailTemplate } from '@/lib/email-templates';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.email || !body.guestName) {
      return NextResponse.json(
        { error: 'Email and guest name are required' },
        { status: 400 }
      );
    }

    // Generate email HTML
    const htmlContent = getRSVPConfirmationEmailTemplate(
      body.guestName,
      body.attending !== false, // true by default
      body.isWaitlisted || false,
      body.hotelChoice,
      body.dietaryRestrictions,
      body.pledgeAmount
    );

    // Send email
    await sendEmail({
      to: body.email,
      subject: body.attending === false 
        ? 'Your RSVP - Brill & Damaris Wedding'
        : 'Your RSVP Confirmed - Brill & Damaris Wedding',
      html: htmlContent
    });

    return NextResponse.json({ 
      success: true,
      message: 'Confirmation email sent successfully'
    });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation email' },
      { status: 500 }
    );
  }
}