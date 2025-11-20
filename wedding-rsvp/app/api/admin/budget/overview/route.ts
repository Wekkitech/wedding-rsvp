// app/api/admin/budget/overview/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get budget categories with spending
    const { data: categories, error: categoriesError } = await supabase
      .from('budget_category_summary')
      .select('*');

    if (categoriesError) throw categoriesError;

    // Get vendor stats
    const { data: vendors } = await supabase
      .from('vendors')
      .select('payment_status')
      .eq('is_active', true);

    const vendorStats = {
      total: vendors?.length || 0,
      paid: vendors?.filter(v => v.payment_status === 'paid').length || 0,
      partial: vendors?.filter(v => v.payment_status === 'partial').length || 0,
      pending: vendors?.filter(v => v.payment_status === 'pending').length || 0,
    };

    // Get verified guest contributions ONLY
    const { data: guestContributions } = await supabase
      .from('guest_contributions')
      .select('amount')
      .eq('verified', true);

    // Get verified external contributions ONLY
    const { data: externalContributions } = await supabase
      .from('external_contributions')
      .select('amount')
      .eq('verified', true);

    // Get total pledges from RSVPs
    const { data: pledges } = await supabase
      .from('rsvps')
      .select('pledge_amount')
      .eq('attending', true)
      .gt('pledge_amount', 0);

    const verifiedGuestAmount = guestContributions?.reduce((sum, gc) => sum + (gc.amount || 0), 0) || 0;
    const verifiedExternalAmount = externalContributions?.reduce((sum, ec) => sum + (ec.amount || 0), 0) || 0;
    const totalPledged = pledges?.reduce((sum, p) => sum + (p.pledge_amount || 0), 0) || 0;
    const totalVerifiedContributions = verifiedGuestAmount + verifiedExternalAmount;

    // Get unverified contributions (pending)
    const { data: pendingGuest } = await supabase
      .from('guest_contributions')
      .select('amount')
      .eq('verified', false);

    const { data: pendingExternal } = await supabase
      .from('external_contributions')
      .select('amount')
      .eq('verified', false);

    const pendingGuestAmount = pendingGuest?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const pendingExternalAmount = pendingExternal?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const totalPendingContributions = pendingGuestAmount + pendingExternalAmount;

    // Calculate totals
    const totalBudget = categories?.reduce((sum, cat) => sum + (cat.allocated_amount || 0), 0) || 0;
    const totalSpent = categories?.reduce((sum, cat) => sum + (cat.spent_amount || 0), 0) || 0;
    const totalRemaining = totalBudget - totalSpent;

    // Contribution stats
    const contributionStats = {
      verified: totalVerifiedContributions,
      verifiedCount: (guestContributions?.length || 0) + (externalContributions?.length || 0),
      pending: totalPendingContributions,
      pendingCount: (pendingGuest?.length || 0) + (pendingExternal?.length || 0),
      pledgedCount: pledges?.length || 0,
    };

    const overview = {
      total_budget: totalBudget,
      total_spent: totalSpent,
      total_remaining: totalRemaining,
      total_pledged: totalPledged,
    };

    return NextResponse.json({
      success: true,
      overview,
      categories: categories || [],
      vendorStats,
      contributionStats,
      recentActivity: [], // TODO: Implement activity log
    });
  } catch (error) {
    console.error('Budget overview error:', error);
    return NextResponse.json(
      { error: 'Failed to load budget overview' },
      { status: 500 }
    );
  }
}