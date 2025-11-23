// app/api/admin/rsvps/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  try {
    // Verify admin
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (adminError || !admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch all RSVPs with guest information
    // CRITICAL: This query structure must match what the frontend expects
    const { data: rsvps, error: rsvpError } = await supabaseAdmin
      .from('rsvps')
      .select(`
        id,
        attending,
        is_waitlisted,
        note,
        dietary_needs,
        pledge_amount,
        hotel_choice,
        created_at,
        updated_at,
        guest_id,
        guests!inner (
          id,
          name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (rsvpError) {
      console.error('Error fetching RSVPs:', rsvpError);
      return NextResponse.json(
        { error: 'Failed to fetch RSVPs', details: rsvpError.message },
        { status: 500 }
      );
    }

    // Transform the data to match frontend expectations
    // Supabase returns guests as an object, we need to flatten it
const transformedRsvps = rsvps?.map(rsvp => {
  // Type assertion to help TypeScript understand the structure
  const guest = rsvp.guests as any;
  
  return {
    id: rsvp.id,
    attending: rsvp.attending,
    is_waitlisted: rsvp.is_waitlisted,
    note: rsvp.note,
    dietary_needs: rsvp.dietary_needs,
    pledge_amount: rsvp.pledge_amount,
    hotel_choice: rsvp.hotel_choice,
    created_at: rsvp.created_at,
    updated_at: rsvp.updated_at,
    guest: {
      id: guest?.id || '',
      name: guest?.name || '',
      email: guest?.email || '',
      phone: guest?.phone || ''
    }
  };
}) || [];

    console.log(`Fetched ${transformedRsvps.length} RSVPs for admin: ${email}`);

    return NextResponse.json({
      rsvps: transformedRsvps,
      total: transformedRsvps.length
    });
  } catch (error) {
    console.error('Error in admin RSVPs route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}