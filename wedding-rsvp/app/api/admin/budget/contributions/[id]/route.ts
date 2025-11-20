import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { verified } = body;

    // Try guest contributions first
    const { data: guestData, error: guestError } = await supabase
      .from('guest_contributions')
      .update({ 
        verified, 
        verified_at: verified ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select();

    if (guestData && guestData.length > 0) {
      return NextResponse.json({
        success: true,
        contribution: guestData[0],
      });
    }

    // Try external contributions
    const { data: externalData, error: externalError } = await supabase
      .from('external_contributions')
      .update({ 
        verified, 
        verified_at: verified ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select();

    if (externalData && externalData.length > 0) {
      return NextResponse.json({
        success: true,
        contribution: externalData[0],
      });
    }

    return NextResponse.json(
      { error: 'Contribution not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update contribution', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // First check if it exists in guest_contributions
    const { data: guestCheck } = await supabase
      .from('guest_contributions')
      .select('id')
      .eq('id', id)
      .single();

    if (guestCheck) {
      // Delete from guest_contributions
      const { error } = await supabase
        .from('guest_contributions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
          { error: 'Failed to delete', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // Check in external_contributions
    const { data: externalCheck } = await supabase
      .from('external_contributions')
      .select('id')
      .eq('id', id)
      .single();

    if (externalCheck) {
      // Delete from external_contributions
      const { error } = await supabase
        .from('external_contributions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
          { error: 'Failed to delete', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // Not found in either table
    return NextResponse.json(
      { error: 'Contribution not found', details: `ID ${id} not found in any table` },
      { status: 404 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}