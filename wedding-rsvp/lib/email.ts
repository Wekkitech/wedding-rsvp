// lib/email.ts
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  console.log('\n📧 ===== EMAIL SEND REQUEST =====');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('From:', process.env.EMAIL_FROM);
  console.log('Has API Key:', !!process.env.RESEND_API_KEY);

  // Check if we have API key
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ NO RESEND API KEY CONFIGURED');
    throw new Error('Resend API key not configured');
  }

  try {
    const payload = {
      from: process.env.EMAIL_FROM || 'noreply@resend.dev',
      to: to, // Send as string, not array
      subject,
      html,
    };

    console.log('📤 Sending to Resend...');
    console.log('Payload:', {
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
      htmlLength: payload.html.length,
    });

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    console.log('📥 Resend Response Status:', response.status);
    console.log('📥 Resend Response Headers:', Object.fromEntries(response.headers.entries()));

    const responseData = await response.json();
    console.log('📥 Resend Response Body:', responseData);

    if (!response.ok) {
      console.error('❌ RESEND API ERROR:', responseData);
      throw new Error(`Resend API error (${response.status}): ${JSON.stringify(responseData)}`);
    }

    console.log('✅ EMAIL SENT SUCCESSFULLY');
    console.log('Email ID:', responseData.id);
    console.log('===== EMAIL SEND COMPLETE =====\n');
    
  } catch (error) {
    console.error('❌ EMAIL SEND FAILED');
    console.error('Error:', error instanceof Error ? error.message : error);
    console.error('===== EMAIL SEND FAILED =====\n');
    throw error; // Always throw so caller knows it failed
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}