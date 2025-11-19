// app/api/admin/budget/vendors/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllVendors, 
  createVendor, 
  updateVendor, 
  deleteVendor 
} from '@/lib/db';
import { verifyAdminSession } from '@/lib/admin-otp';

export const dynamic = 'force-dynamic';

// GET - Fetch all vendors
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

    const vendors = await getAllVendors();
    return NextResponse.json({ vendors });

  } catch (error: any) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}

// POST - Create new vendor
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { valid, role, email } = await verifyAdminSession(sessionToken);
    if (!valid || role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const vendor = await createVendor({
      ...body,
      created_by: email
    });

    return NextResponse.json({ vendor }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to create vendor', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update vendor
export async function PUT(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { valid, role } = await verifyAdminSession(sessionToken);
    if (!valid || role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { id, ...updates } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Vendor ID required' }, { status: 400 });
    }

    const vendor = await updateVendor(id, updates);
    return NextResponse.json({ vendor });

  } catch (error: any) {
    console.error('Error updating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to update vendor', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete vendor (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { valid, role } = await verifyAdminSession(sessionToken);
    if (!valid || role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Vendor ID required' }, { status: 400 });
    }

    await deleteVendor(id);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error deleting vendor:', error);
    return NextResponse.json(
      { error: 'Failed to delete vendor' },
      { status: 500 }
    );
  }
}