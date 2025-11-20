// app/api/admin/guests/[id]/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(request: NextRequest) {
  try {
    // Extract ID directly from URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    console.log('🗑️ DELETE REQUEST');
    console.log('URL:', request.url);
    console.log('Path:', url.pathname);
    console.log('ID from path:', id);

    if (!id || id === 'guests') {
      console.error('NO ID FOUND');
      return NextResponse.json({ error: 'Guest ID is required' }, { status: 400 });
    }

    console.log('✅ ID valid:', id);

    // Delete RSVPs
    console.log('Deleting RSVPs...');
    await supabase.from('rsvps').delete().eq('guest_id', id);

    // Delete guest
    console.log('Deleting guest...');
    const { error } = await supabase.from('guests').delete().eq('id', id);

    if (error) {
      console.error('DELETE ERROR:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ GUEST DELETED:', id);
    return NextResponse.json({ 
      success: true, 
      message: 'Guest deleted successfully',
      deletedId: id
    });
  } catch (error) {
    console.error('EXCEPTION:', error);
    return NextResponse.json({ error: 'Failed to delete guest' }, { status: 500 });
  }
}