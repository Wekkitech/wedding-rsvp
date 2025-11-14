// lib/email.ts
// This is a simple email utility using Resend (recommended)
// You can also use SendGrid, Mailgun, or any other service

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  // Option 1: Using Resend (recommended, easy to set up)
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'wedding@yourdomain.com',
          to: [to],
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Resend API error: ${JSON.stringify(error)}`);
      }

      console.log('Email sent successfully via Resend to:', to);
      return;
    } catch (error) {
      console.error('Resend email error:', error);
      throw error;
    }
  }

  // Option 2: Using SendGrid
  if (process.env.SENDGRID_API_KEY) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: process.env.EMAIL_FROM || 'wedding@yourdomain.com' },
          subject,
          content: [{ type: 'text/html', value: html }],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`SendGrid API error: ${error}`);
      }

      console.log('Email sent successfully via SendGrid to:', to);
      return;
    } catch (error) {
      console.error('SendGrid email error:', error);
      throw error;
    }
  }

  // Development mode: Log to console instead of sending
  if (process.env.NODE_ENV === 'development') {
    console.log('=== EMAIL (Development Mode) ===');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('HTML:', html);
    console.log('================================');
    return;
  }

  // No email service configured
  throw new Error('No email service configured. Please set up RESEND_API_KEY or SENDGRID_API_KEY in your .env file');
}

// Helper to validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}