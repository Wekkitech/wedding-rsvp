import { NextRequest, NextResponse } from 'next/server';
import { createAdmin } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { requestorEmail, email, role } = await request.json();

    if (!requestorEmail || !email || !role) {
      return NextResponse.json(
        { error: 'Requestor email, email, and role are required' },
        { status: 400 }
      );
    }

    if (!['super_admin', 'event_planner'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be super_admin or event_planner' },
        { status: 400 }
      );
    }

    const admin = await createAdmin(requestorEmail, email, role);

    return NextResponse.json({
      success: true,
      message: `Admin ${email} created successfully`,
      admin,
    });
  } catch (error: any) {
    console.error('Error creating admin:', error);

    if (error.message === 'Only super admins can create admins') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error.code === '23505') {
      return NextResponse.json({ error: 'Admin with this email already exists' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}