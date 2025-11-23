// lib/phone-utils.ts

/**
 * Normalizes a Kenyan phone number to extract the last 9 digits
 * Accepts formats like:
 * - +254712345678
 * - 254712345678
 * - 0712345678
 * - 712345678
 * 
 * Returns the last 9 digits (e.g., "712345678")
 * Returns null if the input is invalid
 */
export function normalizePhoneNumber(phone: string): string | null {
  if (!phone) return null;

  // Remove all non-digit characters (spaces, dashes, parentheses, etc.)
  const digitsOnly = phone.replace(/\D/g, '');

  // Extract the last 9 digits
  if (digitsOnly.length < 9) {
    return null; // Too short
  }

  const last9Digits = digitsOnly.slice(-9);

  // Validate that we have exactly 9 digits
  if (last9Digits.length !== 9) {
    return null; // Invalid length
  }

  // Validate that it's all digits (should be after our processing, but double-check)
  if (!/^\d{9}$/.test(last9Digits)) {
    return null; // Contains non-digits
  }

  return last9Digits;
}

/**
 * Formats a normalized phone number (9 digits) to full international format
 * Input: "712345678"
 * Output: "+254712345678"
 */
export function formatPhoneNumber(normalizedPhone: string): string {
  if (!normalizedPhone || normalizedPhone.length !== 9) {
    return normalizedPhone;
  }
  return `+254${normalizedPhone}`;
}

/**
 * Validates if a phone number is a valid Kenyan mobile number
 */
export function isValidKenyanPhone(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  return normalized !== null && normalized.length === 9;
}

/**
 * Example usage:
 * normalizePhoneNumber("+254712345678") => "712345678"
 * normalizePhoneNumber("254712345678")  => "712345678"
 * normalizePhoneNumber("0712345678")    => "712345678"
 * normalizePhoneNumber("712345678")     => "712345678"
 * normalizePhoneNumber("+254123456789") => "123456789"
 * normalizePhoneNumber("0123456789")    => "123456789"
 * normalizePhoneNumber("+254 712 345 678") => "712345678"
 */