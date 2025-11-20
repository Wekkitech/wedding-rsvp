// app/api/admin/budget/contributions/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all contributions (guest + external)
export async function GET(request: NextRequest) {
  try {
    // Fetch guest contributions
    const { data: guestContributions, error: guestError } = await supabase
      .from('guest_contributions')
      .select('*')
      .order('contribution_date', { ascending: false });

    // Fetch external contributions
    const { data: externalContributions, error: externalError } = await supabase
      .from('external_contributions')
      .select('*')
      .order('contribution_date', { ascending: false });

    if (guestError) {
      console.error('Guest contributions error:', guestError);
      return NextResponse.json(
        { error: 'Failed to fetch guest contributions' },
        { status: 500 }
      );
    }

    if (externalError) {
      console.error('External contributions error:', externalError);
      return NextResponse.json(
        { error: 'Failed to fetch external contributions' },
        { status: 500 }
      );
    }

    // Get guest names and phone numbers for guest contributions
    const guestIds = (guestContributions || [])
      .filter(g => g.guest_id)
      .map(g => g.guest_id);
    
    let guestData: any[] = [];
    if (guestIds.length > 0) {
      const { data } = await supabase
        .from('guests')
        .select('id, name, phone')
        .in('id', guestIds);

      guestData = data || [];
    }

    // Format guest contributions
    const formattedGuestContributions = (guestContributions || []).map(gc => {
      const guest = guestData.find(g => g.id === gc.guest_id);
      return {
        id: gc.id,
        contribution_type: 'guest',
        name: guest?.name || gc.name || 'Unknown Guest',
        phone: guest?.phone || gc.phone || '',
        amount: gc.amount,
        payment_method: gc.payment_method,
        mpesa_code: gc.mpesa_code,
        contribution_date: gc.contribution_date,
        verified: gc.verified,
        verified_by: gc.verified_by,
        verified_at: gc.verified_at,
        notes: gc.notes,
      };
    });

    // Format external contributions
    const formattedExternalContributions = (externalContributions || []).map(ec => ({
      id: ec.id,
      contribution_type: 'external',
      name: ec.name,
      phone: ec.phone,
      email: ec.email,
      amount: ec.amount,
      payment_method: ec.payment_method,
      mpesa_code: ec.mpesa_code,
      contribution_date: ec.contribution_date,
      verified: ec.verified,
      verified_by: ec.verified_by,
      verified_at: ec.verified_at,
      notes: ec.notes,
    }));

    const allContributions = [
      ...formattedGuestContributions,
      ...formattedExternalContributions,
    ].sort((a, b) => new Date(b.contribution_date).getTime() - new Date(a.contribution_date).getTime());

    return NextResponse.json({
      success: true,
      contributions: allContributions,
    });
  } catch (error) {
    console.error('GET contributions error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

// POST - Add new contribution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, guest_id, name, phone, email, amount, payment_method, mpesa_code, notes } = body;

    console.log('POST body:', body);

    if (!amount) {
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      );
    }

    if (type === 'external') {
      if (!name) {
        return NextResponse.json(
          { error: 'Name is required for external contribution' },
          { status: 400 }
        );
      }

      // Add to external_contributions
      const { data, error } = await supabase
        .from('external_contributions')
        .insert([
          {
            name,
            phone: phone || null,
            email: email || null,
            amount: parseFloat(String(amount)),
            payment_method: payment_method || null,
            mpesa_code: mpesa_code || null,
            notes: notes || null,
            verified: false,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('External contribution insert error:', error);
        return NextResponse.json(
          { error: 'Failed to add external contribution', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        contribution: data,
      });
    } else if (type === 'guest') {
      if (!guest_id) {
        return NextResponse.json(
          { error: 'Guest selection is required' },
          { status: 400 }
        );
      }

      // Add to guest_contributions
      const { data, error } = await supabase
        .from('guest_contributions')
        .insert([
          {
            guest_id,
            amount: parseFloat(String(amount)),
            payment_method: payment_method || null,
            mpesa_code: mpesa_code || null,
            notes: notes || null,
            verified: false,
            is_pledge_fulfillment: false,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Guest contribution insert error:', error);
        return NextResponse.json(
          { error: 'Failed to add guest contribution', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        contribution: data,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid contribution type. Must be "guest" or "external"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('POST contributions error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}