// app/api/debug-whitelist/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('phone_whitelist')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching whitelist:', error);
      return NextResponse.json({ error: error.message, numbers: [] });
    }

    console.log('Found whitelisted numbers:', data?.length);
    return NextResponse.json({ numbers: data || [], count: data?.length || 0 });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message, numbers: [] });
  }
}