import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAdmin } from '@/lib/db';
export const dynamic = 'force-dynamic';

// GET - Fetch all hotels
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminEmail = searchParams.get('email');

    if (!adminEmail || !(await isAdmin(adminEmail))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('hotels')
      .select('*')
      .order('display_order');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ hotels: data || [] });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return NextResponse.json({ error: 'Failed to fetch hotels' }, { status: 500 });
  }
}

// POST - Add new hotel
export async function POST(request: NextRequest) {
  try {
    const { 
      adminEmail, 
      name, 
      price_min, 
      price_max, 
      proximity,
      contact_phone,
      contact_email,
      website_url,
      description
    } = await request.json();

    if (!adminEmail || !(await isAdmin(adminEmail))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!name || !price_min) {
      return NextResponse.json(
        { error: 'Name and minimum price are required' },
        { status: 400 }
      );
    }

    // Get the highest display_order and add 1
    const { data: maxOrder } = await supabaseAdmin
      .from('hotels')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const display_order = maxOrder ? maxOrder.display_order + 1 : 1;

    // Insert new hotel
    const { data, error } = await supabaseAdmin
      .from('hotels')
      .insert({
        name,
        price_min,
        price_max: price_max || price_min,
        proximity,
        contact_phone,
        contact_email,
        website_url,
        description,
        display_order,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log the action
    await supabaseAdmin.from('admin_audit_log').insert({
      admin_email: adminEmail,
      action: 'add_hotel',
      table_name: 'hotels',
      record_id: data.id,
      new_values: data
    });

    return NextResponse.json({ success: true, hotel: data });
  } catch (error) {
    console.error('Error adding hotel:', error);
    return NextResponse.json({ error: 'Failed to add hotel' }, { status: 500 });
  }
}

// PUT - Update hotel
export async function PUT(request: NextRequest) {
  try {
    const { adminEmail, id, ...updates } = await request.json();

    if (!adminEmail || !(await isAdmin(adminEmail))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Hotel ID required' }, { status: 400 });
    }

    // Get old values for audit log
    const { data: oldHotel } = await supabaseAdmin
      .from('hotels')
      .select('*')
      .eq('id', id)
      .single();

    // Update hotel
    const { data, error } = await supabaseAdmin
      .from('hotels')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log the action
    await supabaseAdmin.from('admin_audit_log').insert({
      admin_email: adminEmail,
      action: 'update_hotel',
      table_name: 'hotels',
      record_id: id,
      old_values: oldHotel,
      new_values: data
    });

    return NextResponse.json({ success: true, hotel: data });
  } catch (error) {
    console.error('Error updating hotel:', error);
    return NextResponse.json({ error: 'Failed to update hotel' }, { status: 500 });
  }
}

// DELETE - Remove hotel
export async function DELETE(request: NextRequest) {
  try {
    const { adminEmail, id } = await request.json();

    if (!adminEmail || !(await isAdmin(adminEmail))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Hotel ID required' }, { status: 400 });
    }

    // Get hotel for audit log
    const { data: hotel } = await supabaseAdmin
      .from('hotels')
      .select('*')
      .eq('id', id)
      .single();

    // Delete hotel
    const { error } = await supabaseAdmin
      .from('hotels')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log the action
    if (hotel) {
      await supabaseAdmin.from('admin_audit_log').insert({
        admin_email: adminEmail,
        action: 'delete_hotel',
        table_name: 'hotels',
        record_id: id,
        old_values: hotel
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    return NextResponse.json({ error: 'Failed to delete hotel' }, { status: 500 });
  }
}