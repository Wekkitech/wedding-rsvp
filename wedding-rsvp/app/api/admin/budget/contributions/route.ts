// app/api/admin/budget/contributions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllContributions, 
  createContribution, 
  verifyContribution 
} from '@/lib/db';
import { verifyAdminSession } from '@/lib/admin-otp';

export const dynamic = 'force-dynamic';

// GET - Fetch all contributions
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { valid, role } = await verifyAdminSession(sessionToken);
    if (!valid || role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const contributions = await getAllContributions();
    return NextResponse.json({ contributions });

  } catch (error: any) {
    console.error('Error fetching contributions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
      { status: 500 }
    );
  }
}

// POST - Create new contribution
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { valid, role } = await verifyAdminSession(sessionToken);
    if (!valid || role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const contribution = await createContribution(body);

    return NextResponse.json({ contribution }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating contribution:', error);
    return NextResponse.json(
      { error: 'Failed to create contribution', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Verify contribution
export async function PUT(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { valid, role, email } = await verifyAdminSession(sessionToken);
    if (!valid || role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if email exists
    if (!email) {
      return NextResponse.json({ error: 'Admin email not found in session' }, { status: 400 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Contribution ID required' }, { status: 400 });
    }

    const contribution = await verifyContribution(id, email);
    return NextResponse.json({ contribution });

  } catch (error: any) {
    console.error('Error verifying contribution:', error);
    return NextResponse.json(
      { error: 'Failed to verify contribution', details: error.message },
      { status: 500 }
    );
  }
}