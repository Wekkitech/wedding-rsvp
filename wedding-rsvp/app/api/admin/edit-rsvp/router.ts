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

    // Verify admin authentication
    const admin = await isAdmin(adminEmail);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' }, 
        { status: 403 }
      );
    }

    // Get old RSVP values for audit log
    const { data: oldRsvp, error: fetchError } = await supabaseAdmin
      .from('rsvps')
      .select('*')
      .eq('id', rsvpId)
      .single();

    if (fetchError || !oldRsvp) {
      return NextResponse.json(
        { error: 'RSVP not found' }, 
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      attending,
      note,
      dietary_needs,
      pledge_amount,
      hotel_choice,
      is_waitlisted,
      pledge_fulfilled,
      updated_at: new Date().toISOString()
    };

    // Set pledge_fulfilled_date if marking as fulfilled
    if (pledge_fulfilled && !oldRsvp.pledge_fulfilled) {
      updateData.pledge_fulfilled_date = new Date().toISOString();
    } else if (!pledge_fulfilled) {
      updateData.pledge_fulfilled_date = null;
    }

    // Update RSVP
    const { data: updatedRsvp, error: updateError } = await supabaseAdmin
      .from('rsvps')
      .update(updateData)
      .eq('id', rsvpId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating RSVP:', updateError);
      return NextResponse.json(
        { error: updateError.message }, 
        { status: 500 }
      );
    }

    // Log the change in audit log
    await supabaseAdmin.from('admin_audit_log').insert({
      admin_email: adminEmail,
      action: 'edit_rsvp',
      table_name: 'rsvps',
      record_id: rsvpId,
      old_values: oldRsvp,
      new_values: updatedRsvp
    });

    return NextResponse.json({ 
      success: true, 
      rsvp: updatedRsvp,
      message: 'RSVP updated successfully'
    });

  } catch (error) {
    console.error('Error in edit-rsvp API:', error);
    return NextResponse.json(
      { error: 'Failed to update RSVP. Please try again.' }, 
      { status: 500 }
    );
  }
}