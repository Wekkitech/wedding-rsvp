// app/api/guests/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Fetch guests with their RSVP and pledge info
    const { data: guests, error: guestsError } = await supabase
      .from('guests')
      .select('id, name, phone')
      .order('name', { ascending: true });

    if (guestsError) {
      console.error('Guests fetch error:', guestsError);
      return NextResponse.json(
        { error: 'Failed to fetch guests', details: guestsError.message },
        { status: 500 }
      );
    }

    // For each guest, get their RSVP pledge info
    const guestIds = (guests || []).map(g => g.id);
    
    let rsvpData: any[] = [];
    if (guestIds.length > 0) {
      const { data } = await supabase
        .from('rsvps')
        .select('guest_id, pledge_amount, attending')
        .in('guest_id', guestIds);

      rsvpData = data || [];
    }

    // Combine guest and pledge data
    const formattedGuests = (guests || [])
      .filter(g => g.phone) // Only guests with phone numbers
      .map(g => {
        const rsvp = rsvpData.find(r => r.guest_id === g.id);
        return {
          id: g.id,
          name: g.name || 'Unknown',
          phone: g.phone || '',
          pledge_amount: rsvp?.pledge_amount || 0,
          attending: rsvp?.attending || false,
        };
      })
      .filter(g => g.attending) // Only show attending guests
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      guests: formattedGuests,
      count: formattedGuests.length,
    });
  } catch (error) {
    console.error('GET guests error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}