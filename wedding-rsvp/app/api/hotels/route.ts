// app/api/hotels/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get all active hotels, ordered by display_order
    const { data, error } = await supabaseAdmin
      .from('hotels')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching hotels:', error);
      return NextResponse.json({ error: 'Failed to fetch hotels' }, { status: 500 });
    }

    return NextResponse.json({ hotels: data || [] });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}