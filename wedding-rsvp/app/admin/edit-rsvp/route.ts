import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAdmin } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { 
      rsvpId, 
      adminEmail,
      attending,
      note,
      dietary_needs,
      pledge_amount,
      hotel_choice,
      is_waitlisted,
      pledge_fulfilled
    } = await request.json();

    // Verify admin
    const admin = await isAdmin(adminEmail);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get old values for audit log
    const { data: oldRsvp } = await supabaseAdmin
      .from('rsvps')
      .select('*')
      .eq('id', rsvpId)
      .single();

    // Update RSVP
    const { data, error } = await supabaseAdmin
      .from('rsvps')
      .update({
        attending,
        note,
        dietary_needs,
        pledge_amount,
        hotel_choice,
        is_waitlisted,
        pledge_fulfilled,
        pledge_fulfilled_date: pledge_fulfilled ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', rsvpId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log the change
    await supabaseAdmin.from('admin_audit_log').insert({
      admin_email: adminEmail,
      action: 'edit_rsvp',
      table_name: 'rsvps',
      record_id: rsvpId,
      old_values: oldRsvp,
      new_values: data
    });

    return NextResponse.json({ success: true, rsvp: data });
  } catch (error) {
    console.error('Error editing RSVP:', error);
    return NextResponse.json({ error: 'Failed to update RSVP' }, { status: 500 });
  }
}