// app/api/messages/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch RSVPs with messages from attending guests only
    const { data: rsvps, error } = await supabaseAdmin
      .from('rsvps')
      .select(`
        id,
        note,
        created_at,
        guests!inner (
          name
        )
      `)
      .eq('attending', true)
      .not('note', 'is', null)
      .neq('note', '')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Transform the data
    const messages = rsvps?.map(rsvp => ({
      id: rsvp.id,
      message: rsvp.note,
      guestName: (rsvp.guests as any)?.name || 'A Loved One',
      date: rsvp.created_at
    })) || [];

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error in messages route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}