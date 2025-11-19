// app/api/admin/budget/summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBudgetOverview, getContributionStats } from '@/lib/db';
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

    if (!valid || role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch summary data
    const [overview, contributionStats] = await Promise.all([
      getBudgetOverview(),
      getContributionStats()
    ]);

    return NextResponse.json({
      total_budget: overview?.total_budget || 0,
      total_spent: overview?.total_spent || 0,
      total_remaining: overview?.total_remaining || 0,
      total_contributions: contributionStats?.verified || 0,
      contributions_count: contributionStats?.verifiedCount || 0,
      total_pledged: overview?.total_pledged || 0
    });

  } catch (error: any) {
    console.error('Error fetching budget summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget summary' },
      { status: 500 }
    );
  }
}