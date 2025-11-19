// app/api/admin/budget/overview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  getBudgetOverview, 
  getCategorySummary,
  getVendorStats,
  getContributionStats,
  getRecentActivity
} from '@/lib/db';
import { verifyAdminSession } from '@/lib/admin-otp';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const sessionToken = request.cookies.get('admin_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { valid, role } = await verifyAdminSession(sessionToken);

    if (!valid) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Super admins can view budget, event planners cannot
    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch all budget data
    const [
      overview,
      categories,
      vendorStats,
      contributionStats,
      recentActivity
    ] = await Promise.all([
      getBudgetOverview(),
      getCategorySummary(),
      getVendorStats(),
      getContributionStats(),
      getRecentActivity(20)
    ]);

    return NextResponse.json({
      overview,
      categories,
      vendorStats,
      contributionStats,
      recentActivity
    });

  } catch (error: any) {
    console.error('Error fetching budget overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget data', details: error.message },
      { status: 500 }
    );
  }
}