import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAdmin } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const adminEmail = searchParams.get('email');

    // Verify admin
    if (!adminEmail || !(await isAdmin(adminEmail))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Await the params (Next.js 15+ requirement)
    const params = await context.params;
    const guestId = params.id;

    // Get guest details before deletion for audit log
    const { data: guest, error: fetchError } = await supabaseAdmin
      .from('guests')
      .select('*')
      .eq('id', guestId)
      .single();

    if (fetchError || !guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    // Delete guest (will cascade to rsvps and pledges due to FK constraints)
    const { error: deleteError } = await supabaseAdmin
      .from('guests')
      .delete()
      .eq('id', guestId);

    if (deleteError) {
      console.error('Error deleting guest:', deleteError);
      return NextResponse.json({ error: 'Failed to delete guest' }, { status: 500 });
    }

    // Log the deletion in audit log
    await supabaseAdmin.from('admin_audit_log').insert({
      admin_email: adminEmail,
      action: 'delete_guest',
      table_name: 'guests',
      record_id: guestId,
      old_values: guest,
      new_values: null,
    });

    return NextResponse.json({ 
      success: true, 
      message: `Guest ${guest.name || guest.email} deleted successfully` 
    });
  } catch (error) {
    console.error('Error in DELETE /api/admin/guests/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
