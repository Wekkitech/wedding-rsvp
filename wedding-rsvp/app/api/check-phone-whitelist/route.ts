// app/api/check-phone-whitelist/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { normalizePhoneNumber } from '@/lib/phone-utils';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');

  console.log('Checking phone whitelist for:', phone);

  if (!phone) {
    return NextResponse.json(
      { error: 'Phone number is required', allowed: false },
      { status: 400 }
    );
  }

  // Normalize the phone number to last 9 digits
  const normalizedPhone = normalizePhoneNumber(phone);
  
  if (!normalizedPhone) {
    return NextResponse.json(
      { error: 'Invalid phone number format', allowed: false },
      { status: 400 }
    );
  }

  console.log('Normalized phone:', normalizedPhone);

  try {
    // Check if phone exists in whitelist using normalized format
    // We'll check against the last 9 digits of stored numbers
    const { data: allWhitelist, error: fetchError } = await supabaseAdmin
      .from('phone_whitelist')
      .select('phone, name');

    if (fetchError) {
      console.error('Error fetching whitelist:', fetchError);
      return NextResponse.json(
        { error: 'Database error', allowed: false },
        { status: 500 }
      );
    }

    // Find matching phone by comparing normalized versions
    const match = allWhitelist?.find(entry => {
      const storedNormalized = normalizePhoneNumber(entry.phone);
      return storedNormalized === normalizedPhone;
    });

    if (match) {
      console.log('Phone is whitelisted:', match);
      return NextResponse.json({
        allowed: true,
        guest: match
      });
    } else {
      console.log('Phone not found in whitelist');
      return NextResponse.json({
        allowed: false,
        message: 'Phone number not found in guest list'
      });
    }
  } catch (error) {
    console.error('Error checking phone whitelist:', error);
    return NextResponse.json(
      { error: 'Database error', allowed: false },
      { status: 500 }
    );
  }
}