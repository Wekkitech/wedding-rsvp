import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const DEADLINE_DATE = new Date('2025-12-20T23:59:59Z');

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      phone,
      name,
      email,
      attending,
      note,
      dietary_needs,
      pledge_amount,
      hotel_choice,
    } = body;

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Check if past deadline
    const now = new Date();
    if (now > DEADLINE_DATE) {
      return NextResponse.json(
        { 
          error: 'Update deadline has passed', 
          message: 'The deadline for RSVP updates was December 20th, 2025. Please contact us directly for changes.' 
        },
        { status: 403 }
      );
    }

    // Get guest by phone
    const { data: guest, error: guestError } = await supabaseAdmin
      .from('guests')
      .select('id')
      .eq('phone', phone)
      .single();

    if (guestError || !guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      );
    }

    // Update guest info
    const { error: guestUpdateError } = await supabaseAdmin
      .from('guests')
      .update({
        name,
        email: email || null,
        last_login: new Date().toISOString(),
      })
      .eq('id', guest.id);

    if (guestUpdateError) {
      console.error('Error updating guest:', guestUpdateError);
      return NextResponse.json(
        { error: 'Failed to update guest information' },
        { status: 500 }
      );
    }

    // Get existing RSVP
    const { data: existingRSVP, error: rsvpFetchError } = await supabaseAdmin
      .from('rsvps')
      .select('*')
      .eq('guest_id', guest.id)
      .single();

    if (rsvpFetchError || !existingRSVP) {
      return NextResponse.json(
        { error: 'RSVP not found' },
        { status: 404 }
      );
    }

    // Update RSVP
    const { data: updatedRSVP, error: rsvpUpdateError } = await supabaseAdmin
      .from('rsvps')
      .update({
        attending,
        note,
        dietary_needs,
        pledge_amount: pledge_amount ? parseFloat(pledge_amount) : null,
        hotel_choice,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingRSVP.id)
      .select()
      .single();

    if (rsvpUpdateError) {
      console.error('Error updating RSVP:', rsvpUpdateError);
      return NextResponse.json(
        { error: 'Failed to update RSVP' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'RSVP updated successfully',
      rsvp: updatedRSVP,
    });
  } catch (error) {
    console.error('Error in PUT /api/rsvp/update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}