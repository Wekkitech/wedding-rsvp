// app/api/rsvp/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
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

    // Verify phone is whitelisted
    const { data: whitelistCheck, error: whitelistError } = await supabaseAdmin
      .from('phone_whitelist')
      .select('*')
      .eq('phone', phone)
      .single();

    if (whitelistError || !whitelistCheck) {
      return NextResponse.json(
        { error: 'Phone number not authorized' },
        { status: 403 }
      );
    }

    // Check if guest exists (by phone)
    let guest;
    const { data: existingGuest } = await supabaseAdmin
      .from('guests')
      .select('*')
      .eq('phone', phone)
      .single();

    if (existingGuest) {
      // Update existing guest
      const { data: updatedGuest, error: updateError } = await supabaseAdmin
        .from('guests')
        .update({
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
      // Create new guest
      const { data: newGuest, error: createError } = await supabaseAdmin
        .from('guests')
        .insert({
          phone,
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

// GET - Fetch RSVP by phone
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');

  if (!phone) {
    return NextResponse.json({ error: 'Phone required' }, { status: 400 });
  }

  try {
    // Get guest by phone
    const { data: guest, error: guestError } = await supabaseAdmin
      .from('guests')
      .select('*')
      .eq('phone', phone)
      .single();

    if (guestError || !guest) {
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