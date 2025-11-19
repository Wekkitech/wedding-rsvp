// app/api/admin/budget/vendors/payments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createVendorPayment, getVendorPayments } from '@/lib/db';
import { verifyAdminSession } from '@/lib/admin-otp';

export const dynamic = 'force-dynamic';

// GET - Fetch payments for a vendor
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

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');
    
    if (!vendorId) {
      return NextResponse.json({ error: 'Vendor ID required' }, { status: 400 });
    }

    const payments = await getVendorPayments(vendorId);
    return NextResponse.json({ payments });

  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST - Add payment to vendor
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
    const payment = await createVendorPayment({
      ...body,
      recorded_by: email
    });

    return NextResponse.json({ payment }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to record payment', details: error.message },
      { status: 500 }
    );
  }
}