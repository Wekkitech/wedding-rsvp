import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('rsvps')
    .select(`
      id,
      attending,
      guest:guests(
        id,
        name,
        email,
        phone
      )
    `)
    .limit(1);

  return NextResponse.json({ data, error });
}
