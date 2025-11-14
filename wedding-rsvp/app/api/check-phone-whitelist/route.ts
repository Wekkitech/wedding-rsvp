// app/api/check-phone-whitelist/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

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

  try {
    // Check if phone exists in whitelist
    const { data, error } = await supabaseAdmin
      .from('phone_whitelist')
      .select('phone, name')
      .eq('phone', phone)
      .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors when not found

    console.log('Whitelist check result:', { data, error });

    if (error) {
      console.error('Error checking phone whitelist:', error);
      // Don't return error for PGRST116 (not found), just say not allowed
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          allowed: false,
          message: 'Phone number not found in guest list'
        });
      }
      return NextResponse.json(
        { error: 'Database error', allowed: false },
        { status: 500 }
      );
    }

    if (data) {
      console.log('Phone is whitelisted:', data);
      return NextResponse.json({
        allowed: true,
        guest: data
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