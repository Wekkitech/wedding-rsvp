// lib/admin-otp.ts
import { supabaseAdmin } from './supabase-admin';
import crypto from 'crypto';
import { getAdminRole } from './db';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create and store OTP for admin login
 */
export async function createAdminOTP(
  email: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ otp: string; expiresAt: Date }> {
  const otp = generateOTP();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

  // Invalidate any existing unused OTPs for this email
  await supabaseAdmin
    .from('admin_otp')
    .update({ used: true })
    .eq('email', email)
    .eq('used', false);

  // Create new OTP
  const { error } = await supabaseAdmin
    .from('admin_otp')
    .insert({
      email,
      otp_code: otp,
      expires_at: expiresAt.toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent,
    });

  if (error) {
    console.error('Error creating OTP:', error);
    throw new Error('Failed to create OTP');
  }

  return { otp, expiresAt };
}

/**
 * Verify OTP and mark as used
 */
export async function verifyAdminOTP(
  email: string,
  otp: string
): Promise<{ valid: boolean; error?: string }> {
  // Get the most recent unused OTP for this email
  const { data, error } = await supabaseAdmin
    .from('admin_otp')
    .select('*')
    .eq('email', email)
    .eq('otp_code', otp)
    .eq('used', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return { valid: false, error: 'Invalid OTP code' };
  }

  // Check if expired
  if (new Date(data.expires_at) < new Date()) {
    return { valid: false, error: 'OTP has expired' };
  }

  // Check attempts
  if (data.attempts >= MAX_ATTEMPTS) {
    return { valid: false, error: 'Too many attempts. Please request a new OTP.' };
  }

  // Mark as used
  await supabaseAdmin
    .from('admin_otp')
    .update({ used: true })
    .eq('id', data.id);

  return { valid: true };
}

/**
 * Increment failed attempt counter
 */
export async function incrementOTPAttempts(email: string, otp: string): Promise<void> {
  // Get current attempts
  const { data } = await supabaseAdmin
    .from('admin_otp')
    .select('attempts')
    .eq('email', email)
    .eq('otp_code', otp)
    .eq('used', false)
    .single();

  if (data) {
    await supabaseAdmin
      .from('admin_otp')
      .update({ attempts: (data.attempts || 0) + 1 })
      .eq('email', email)
      .eq('otp_code', otp)
      .eq('used', false);
  }
}

/**
 * Create admin session
 */
export async function createAdminSession(
  email: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ sessionToken: string; expiresAt: Date; role: string }> {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

  // Get admin role
  const { role } = await getAdminRole(email);

  const { error } = await supabaseAdmin
    .from('admin_sessions')
    .insert({
      email,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent,
      role: role || 'event_planner',
    });

  if (error) {
    console.error('Error creating session:', error);
    throw new Error('Failed to create session');
  }

  return { sessionToken, expiresAt, role: role || 'event_planner' };
}

/**
 * Verify admin session
 */
export async function verifyAdminSession(
  sessionToken: string
): Promise<{ valid: boolean; email?: string; role?: string }> {
  const { data, error } = await supabaseAdmin
    .from('admin_sessions')
    .select('*')
    .eq('session_token', sessionToken)
    .single();

  if (error || !data) {
    return { valid: false };
  }

  // Check if expired
  if (new Date(data.expires_at) < new Date()) {
    // Delete expired session
    await supabaseAdmin
      .from('admin_sessions')
      .delete()
      .eq('id', data.id);
    
    return { valid: false };
  }

  // Update last activity
  await supabaseAdmin
    .from('admin_sessions')
    .update({ last_activity: new Date().toISOString() })
    .eq('id', data.id);

  return { valid: true, email: data.email, role: data.role };
}

/**
 * Delete admin session (logout)
 */
export async function deleteAdminSession(sessionToken: string): Promise<void> {
  await supabaseAdmin
    .from('admin_sessions')
    .delete()
    .eq('session_token', sessionToken);
}

/**
 * Clean up expired OTPs and sessions
 */
export async function cleanupExpired(): Promise<void> {
  const now = new Date().toISOString();
  
  // Delete expired OTPs
  await supabaseAdmin
    .from('admin_otp')
    .delete()
    .lt('expires_at', now);

  // Delete expired sessions
  await supabaseAdmin
    .from('admin_sessions')
    .delete()
    .lt('expires_at', now);
}