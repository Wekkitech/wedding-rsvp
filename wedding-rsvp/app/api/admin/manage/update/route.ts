import { NextRequest, NextResponse } from 'next/server';
import { updateAdminRole } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const { requestorEmail, targetEmail, role } = await request.json();

    if (!requestorEmail || !targetEmail || !role) {
      return NextResponse.json(
        { error: 'Requestor email, target email, and role are required' },
        { status: 400 }
      );
    }

    if (!['super_admin', 'event_planner'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be super_admin or event_planner' },
        { status: 400 }
      );
    }

    const admin = await updateAdminRole(requestorEmail, targetEmail, role);

    return NextResponse.json({
      success: true,
      message: `Admin ${targetEmail} role updated to ${role}`,
      admin,
    });
  } catch (error: any) {
    console.error('Error updating admin:', error);

    if (error.message.includes('Only super admins') || error.message.includes('Cannot remove')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}