'use server';

import { sendEmail } from './email';

interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmailAction({ to, subject, html }: SendEmailRequest) {
  try {
    await sendEmail({ to, subject, html });
    return { success: true };
  } catch (error) {
    console.error('Email action error:', error);
    throw error;
  }
}