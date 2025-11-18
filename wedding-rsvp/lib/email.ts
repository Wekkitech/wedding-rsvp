// lib/email.ts
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  // Production: Try to send via Resend first
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'noreply@wedding.brukhministries.co.ke',
          to: [to],
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Resend API error:', error);
        throw new Error(`Resend API error: ${JSON.stringify(error)}`);
      }

      console.log('✅ Email sent successfully via Resend to:', to);
      return;
    } catch (error) {
      console.error('❌ Resend email error:', error);
      
      // In development, fall back to console logging
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Email send failed, logging to console instead');
        console.log('=== EMAIL (Development Mode - Fallback) ===');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('================================');
        return; // Don't throw error in dev
      }
      
      throw error; // Throw in production
    }
  }

  // Development mode fallback: Log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('=== EMAIL (Development Mode - No Resend) ===');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('================================');
    return;
  }

  // No email service configured
  throw new Error('No email service configured');
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}