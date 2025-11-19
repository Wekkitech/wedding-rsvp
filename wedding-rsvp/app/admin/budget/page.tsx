'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Download
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface BudgetData {
  overview: any;
  categories: any[];
  vendorStats: any;
  contributionStats: any;
  recentActivity: any;
}

export default function BudgetDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BudgetData | null>(null);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const response = await fetch('/api/admin/auth/verify-session');
      if (response.ok) {
        const authData = await response.json();
        if (authData.valid && authData.role === 'super_admin') {
          loadBudgetData();
        } else {
          toast({
            title: 'Access Denied',
            description: 'Only super admins can access budget management.',
            variant: 'destructive',
          });
          router.push('/admin');
        }
      } else {
        router.push('/admin');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/admin');
    }
  };

  const loadBudgetData = async () => {
    try {
      const response = await fetch('/api/admin/budget/overview');
      const budgetData = await response.json();

      if (response.ok) {
        setData(budgetData);
      } else {
        toast({
          title: 'Error',
          description: budgetData.error || 'Failed to load budget data',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load budget data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatPercentage = (value: number) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-mahogany-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Failed to Load Budget Data</h2>
          <Button onClick={() => router.push('/admin')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const { overview, categories, vendorStats, contributionStats, recentActivity } = data;
  const percentageSpent = overview?.total_budget 
    ? (overview.total_spent / overview.total_budget) * 100 
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif text-mahogany-800 mb-2">Budget Management</h1>
            <p className="text-bronze-600">Track expenses, vendors, and contributions</p>
          </div>
          <Button onClick={() => {/* TODO: Export report */}}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Budget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overview?.total_budget)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Allocated across {categories?.length} categories
            </p>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(overview?.total_spent)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatPercentage(percentageSpent)} of budget
            </p>
            <Progress value={percentageSpent} className="mt-2" />
          </CardContent>
        </Card>

        {/* Remaining Budget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(overview?.total_remaining)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatPercentage(100 - percentageSpent)} left to spend
            </p>
          </CardContent>
        </Card>

        {/* Guest Contributions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contributions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(contributionStats?.verified)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {contributionStats?.verifiedCount} verified gifts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown & Vendor Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Category Spending */}
        <Card>
          <CardHeader>
            <CardTitle>Budget by Category</CardTitle>
            <CardDescription>Spending breakdown across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories?.map((cat: any) => (
                <div key={cat.id}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(cat.spent_amount)}</div>
                      <div className="text-xs text-muted-foreground">
                        of {formatCurrency(cat.allocated_amount)}
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={Number(cat.percentage_spent) || 0} 
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatPercentage(Number(cat.percentage_spent))} spent
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vendor & Contribution Stats */}
        <div className="space-y-6">
          {/* Vendor Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Payments</CardTitle>
              <CardDescription>Payment status overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">Paid</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {vendorStats?.paid || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium">Partial</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">
                    {vendorStats?.partial || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">
                    {vendorStats?.pending || 0}
                  </span>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Vendors</span>
                    <span className="text-xl font-bold">{vendorStats?.total || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guest Pledges & Contributions */}
          <Card>
            <CardHeader>
              <CardTitle>Guest Contributions</CardTitle>
              <CardDescription>Pledge tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Pledged</span>
                  <span className="text-lg font-semibold">
                    {formatCurrency(overview?.total_pledged)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-600">Verified</span>
                  <span className="text-lg font-semibold text-green-600">
                    {formatCurrency(contributionStats?.verified)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-yellow-600">Pending</span>
                  <span className="text-lg font-semibold text-yellow-600">
                    {formatCurrency(contributionStats?.pending)}
                  </span>
                </div>

                <Progress 
                  value={overview?.total_pledged ? (contributionStats?.verified / overview.total_pledged) * 100 : 0} 
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/budget/vendors')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Manage Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add, edit, and track vendor payments
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/budget/contributions')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Track Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Verify guest contributions and pledges
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/budget/categories')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Manage Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Adjust budget allocations by category
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}