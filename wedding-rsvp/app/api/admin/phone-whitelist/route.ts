// app/api/admin/phone-whitelist/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
export const dynamic = 'force-dynamic';

// GET - List all whitelisted phones
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

    // Get all whitelist entries
    const { data, error } = await supabaseAdmin
      .from('phone_whitelist')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching whitelist:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ entries: data || [] });
  } catch (error) {
    console.error('Error fetching whitelist:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST - Add phone(s) to whitelist
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminEmail, phone, name, notes, bulk, phones } = body;

    if (!adminEmail) {
      return NextResponse.json({ error: 'Admin email required' }, { status: 400 });
    }

    // Verify admin
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (adminError || !admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (bulk && phones) {
      // Bulk add
      const phonesToInsert = phones.map((entry: any) => ({
        phone: entry.phone,
        name: entry.name || null,
        notes: entry.notes || null,
        added_by: adminEmail
      }));

      const { data, error } = await supabaseAdmin
        .from('phone_whitelist')
        .upsert(phonesToInsert, { 
          onConflict: 'phone',
          ignoreDuplicates: true 
        })
        .select();

      if (error) {
        console.error('Error bulk adding phones:', error);
        return NextResponse.json({ error: 'Failed to add phone numbers' }, { status: 500 });
      }

      // Log audit
      await supabaseAdmin
        .from('admin_audit_log')
        .insert({
          admin_email: adminEmail,
          action: 'BULK_ADD',
          table_name: 'phone_whitelist',
          new_values: { count: data?.length || 0 }
        });

      return NextResponse.json({ success: true, added: data?.length || 0 });
    } else {
      // Single add
      if (!phone) {
        return NextResponse.json({ error: 'Phone required' }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin
        .from('phone_whitelist')
        .upsert(
          {
            phone,
            name: name || null,
            notes: notes || null,
            added_by: adminEmail
          },
          { onConflict: 'phone' }
        )
        .select()
        .single();

      if (error) {
        console.error('Error adding phone:', error);
        return NextResponse.json({ error: 'Failed to add phone number' }, { status: 500 });
      }

      // Log audit
      await supabaseAdmin
        .from('admin_audit_log')
        .insert({
          admin_email: adminEmail,
          action: 'ADD',
          table_name: 'phone_whitelist',
          record_id: data.id,
          new_values: data
        });

      return NextResponse.json({ success: true, entry: data });
    }
  } catch (error) {
    console.error('Error adding to whitelist:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// DELETE - Remove phone from whitelist
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { adminEmail, id } = body;

    if (!adminEmail || !id) {
      return NextResponse.json({ error: 'Admin email and ID required' }, { status: 400 });
    }

    // Verify admin
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (adminError || !admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get old values for audit
    const { data: oldData } = await supabaseAdmin
      .from('phone_whitelist')
      .select('*')
      .eq('id', id)
      .single();

    // Delete
    const { error } = await supabaseAdmin
      .from('phone_whitelist')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting phone:', error);
      return NextResponse.json({ error: 'Failed to delete phone number' }, { status: 500 });
    }

    // Log audit
    if (oldData) {
      await supabaseAdmin
        .from('admin_audit_log')
        .insert({
          admin_email: adminEmail,
          action: 'DELETE',
          table_name: 'phone_whitelist',
          record_id: id,
          old_values: oldData
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting from whitelist:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}