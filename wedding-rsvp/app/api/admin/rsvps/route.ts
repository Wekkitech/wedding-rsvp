// app/api/rsvp/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { normalizePhoneNumber, formatPhoneNumber } from '@/lib/phone-utils';
export const dynamic = 'force-dynamic';

const MAX_GUESTS = 70;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, name, email, attending, note, dietary_needs, pledge_amount, hotel_choice } = body;

    if (!phone || !name) {
      return NextResponse.json(
        { error: 'Phone and name are required' },
        { status: 400 }
      );
    }

    // Normalize the phone number
    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }
    const formattedPhone = formatPhoneNumber(normalizedPhone);

    // Verify phone is whitelisted (using normalized comparison)
    const { data: allWhitelist, error: whitelistFetchError } = await supabaseAdmin
      .from('phone_whitelist')
      .select('*');

    if (whitelistFetchError) {
      console.error('Error fetching whitelist:', whitelistFetchError);
      return NextResponse.json(
        { error: 'Failed to verify phone' },
        { status: 500 }
      );
    }

    // Find matching phone by comparing normalized versions
    const whitelistMatch = allWhitelist?.find(entry => {
      const storedNormalized = normalizePhoneNumber(entry.phone);
      return storedNormalized === normalizedPhone;
    });

    if (!whitelistMatch) {
      return NextResponse.json(
        { error: 'Phone number not authorized' },
        { status: 403 }
      );
    }

    // Check if guest exists (by normalized phone)
    let guest;
    const { data: allGuests } = await supabaseAdmin
      .from('guests')
      .select('*');

    // Find existing guest by normalized phone
    const existingGuest = allGuests?.find(g => {
      const storedNormalized = normalizePhoneNumber(g.phone);
      return storedNormalized === normalizedPhone;
    });

    if (existingGuest) {
      // Update existing guest (ensure phone is in consistent format)
      const { data: updatedGuest, error: updateError } = await supabaseAdmin
        .from('guests')
        .update({
          phone: formattedPhone, // Update to consistent format
          name,
          email: email || existingGuest.email,
          last_login: new Date().toISOString()
        })
        .eq('id', existingGuest.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating guest:', updateError);
        return NextResponse.json({ error: 'Failed to update guest' }, { status: 500 });
      }
      guest = updatedGuest;
    } else {
      // Create new guest (with normalized phone)
      const { data: newGuest, error: createError } = await supabaseAdmin
        .from('guests')
        .insert({
          phone: formattedPhone, // Store in consistent format
          name,
          email: email || null
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating guest:', createError);
        return NextResponse.json({ error: 'Failed to create guest' }, { status: 500 });
      }
      guest = newGuest;
    }

    // Check capacity for waitlisting
    let isWaitlisted = false;
    if (attending) {
      const { count } = await supabaseAdmin
        .from('rsvps')
        .select('*', { count: 'exact', head: true })
        .eq('attending', true)
        .eq('is_waitlisted', false);

      if ((count || 0) >= MAX_GUESTS) {
        isWaitlisted = true;
      }
    }

    // Check if RSVP exists
    const { data: existingRSVP } = await supabaseAdmin
      .from('rsvps')
      .select('*')
      .eq('guest_id', guest.id)
      .single();

    let rsvp;
    if (existingRSVP) {
      // Update existing RSVP
      const { data: updatedRSVP, error: updateError } = await supabaseAdmin
        .from('rsvps')
        .update({
          attending,
          note,
          dietary_needs,
          pledge_amount: pledge_amount ? parseFloat(pledge_amount) : null,
          hotel_choice,
          is_waitlisted: attending ? isWaitlisted : false,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRSVP.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating RSVP:', updateError);
        return NextResponse.json({ error: 'Failed to update RSVP' }, { status: 500 });
      }
      rsvp = updatedRSVP;
    } else {
      // Create new RSVP
      const { data: newRSVP, error: createError } = await supabaseAdmin
        .from('rsvps')
        .insert({
          guest_id: guest.id,
          attending,
          note,
          dietary_needs,
          pledge_amount: pledge_amount ? parseFloat(pledge_amount) : null,
          hotel_choice,
          is_waitlisted: attending ? isWaitlisted : false
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating RSVP:', createError);
        return NextResponse.json({ error: 'Failed to create RSVP' }, { status: 500 });
      }
      rsvp = newRSVP;
    }

    return NextResponse.json({ 
      success: true, 
      rsvp,
      guest 
    });
  } catch (error) {
    console.error('Error processing RSVP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Fetch RSVP by phone (with normalization)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');

  if (!phone) {
    return NextResponse.json({ error: 'Phone required' }, { status: 400 });
  }

  // Normalize the phone number
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) {
    return NextResponse.json({ error: 'Invalid phone format' }, { status: 400 });
  }

  try {
    // Get all guests and find by normalized phone
    const { data: allGuests, error: guestFetchError } = await supabaseAdmin
      .from('guests')
      .select('*');

    if (guestFetchError) {
      console.error('Error fetching guests:', guestFetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Find guest by normalized phone
    const guest = allGuests?.find(g => {
      const storedNormalized = normalizePhoneNumber(g.phone);
      return storedNormalized === normalizedPhone;
    });

    if (!guest) {
      return NextResponse.json({ rsvp: null });
    }

    // Get RSVP
    const { data: rsvp, error: rsvpError } = await supabaseAdmin
      .from('rsvps')
      .select('*')
      .eq('guest_id', guest.id)
      .single();

    if (rsvpError) {
      return NextResponse.json({ rsvp: null });
    }

    return NextResponse.json({ 
      rsvp: {
        ...rsvp,
        guest
      }
    });
  } catch (error) {
    console.error('Error fetching RSVP:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}