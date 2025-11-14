import { supabaseAdmin } from './supabase-admin';
import crypto from 'crypto';

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function createMagicLink(email: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // Valid for 24 hours

  const { error } = await supabaseAdmin
    .from('magic_links')
    .insert({
      email,
      token,
      expires_at: expiresAt.toISOString(),
      used: false,
    });

  if (error) {
    console.error('Error creating magic link:', error);
    throw new Error('Failed to create magic link');
  }

  return token;
}

export async function verifyMagicLink(token: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('magic_links')
    .select('*')
    .eq('token', token)
    .eq('used', false)
    .single();

  if (error || !data) {
    return null;
  }

  // Check if expired
  if (new Date(data.expires_at) < new Date()) {
    return null;
  }

  // Mark as used
  await supabaseAdmin
    .from('magic_links')
    .update({ used: true })
    .eq('token', token);

  return data.email;
}

export function getMagicLinkUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/auth/verify?token=${token}`;
}
