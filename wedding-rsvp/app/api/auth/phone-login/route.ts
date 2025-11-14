import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
export const dynamic = 'force-dynamic';


export async function POST(request: NextRequest) {
  try {
    const { phone, name } = await request.json();

    if (!phone || !name) {
      return NextResponse.json({ error: 'Phone and name required' }, { status: 400 });
    }

    // Validate phone format
    const phoneRegex = /^\+2547[0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone format' }, { status: 400 });
    }

    // Check if phone is whitelisted
    const { data: whitelist } = await supabaseAdmin
      .from('phone_whitelist')
      .select('id')
      .eq('phone', phone)
      .single();

    if (!whitelist) {
      return NextResponse.json({ error: 'Phone not whitelisted' }, { status: 403 });
    }

    // Check if guest exists
    let { data: guest, error: guestError } = await supabaseAdmin
      .from('guests')
      .select('*')
      .eq('phone', phone)
      .single();

    // Create guest if doesn't exist
    if (guestError && guestError.code === 'PGRST116') {
      const { data: newGuest, error: createError } = await supabaseAdmin
        .from('guests')
        .insert({
          phone,
          name,
          email: `${phone.replace(/[^0-9]/g, '')}@phone.guest` // Placeholder email
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }

      guest = newGuest;
    } else if (guestError) {
      return NextResponse.json({ error: guestError.message }, { status: 500 });
    }

    // Update name if it changed
    if (guest && guest.name !== name) {
      const { data: updatedGuest } = await supabaseAdmin
        .from('guests')
        .update({ name })
        .eq('id', guest.id)
        .select()
        .single();
      
      guest = updatedGuest || guest;
    }

    return NextResponse.json({ 
      success: true, 
      guest: {
        id: guest.id,
        phone: guest.phone,
        name: guest.name
      }
    });
  } catch (error) {
    console.error('Phone login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
