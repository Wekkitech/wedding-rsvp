import { NextRequest, NextResponse } from 'next/server';
import { listAdmins } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestorEmail = searchParams.get('email');

    if (!requestorEmail) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const admins = await listAdmins(requestorEmail);

    return NextResponse.json({ admins });
  } catch (error: any) {
    console.error('Error listing admins:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}