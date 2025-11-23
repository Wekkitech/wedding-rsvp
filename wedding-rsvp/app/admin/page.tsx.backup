'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Users, CheckCircle, XCircle, Clock, DollarSign, Download, Loader2, Mail, Lock, LogOut, Shield, MessageSquare, Eye } from 'lucide-react';
import EditRSVPModal from '@/components/EditRSVPModal';
import DeleteGuestButton from '@/components/DeleteGuestButton';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RSVPData {
  id: string;
  attending: boolean;
  is_waitlisted: boolean;
  note: string | null;
  dietary_needs: string | null;
  pledge_amount: number | null;
  hotel_choice: string | null;
  created_at: string;
  guest: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
}

// Message Viewer Modal Component
function MessageViewerModal({ rsvp }: { rsvp: RSVPData }) {
  const hasMessage = rsvp.note && rsvp.note.trim().length > 0;
  const hasDietary = rsvp.dietary_needs && rsvp.dietary_needs.trim().length > 0;
  const hasAny = hasMessage || hasDietary;

  if (!hasAny) {
    return (
      <Button variant="ghost" size="sm" disabled className="text-muted-foreground">
        <MessageSquare className="h-4 w-4 mr-1" />
        No message
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Eye className="h-4 w-4" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-mahogany-600" />
            Message from {rsvp.guest.name}
          </DialogTitle>
          <DialogDescription>
            {rsvp.guest.email} • {new Date(rsvp.created_at).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Message for the Couple */}
          {hasMessage && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-mahogany-700 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Message for the Couple
              </h3>
              <div className="p-4 bg-sage-50 border border-sage-200 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {rsvp.note}
                </p>
              </div>
            </div>
          )}

          {/* Dietary Requirements */}
          {hasDietary && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-mahogany-700">
                Dietary Requirements
              </h3>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {rsvp.dietary_needs}
                </p>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Status:</span>
                <span className="ml-2">
                  {rsvp.is_waitlisted ? (
                    <span className="text-amber-600 font-medium">Waitlisted</span>
                  ) : rsvp.attending ? (
                    <span className="text-green-600 font-medium">Attending</span>
                  ) : (
                    <span className="text-red-600 font-medium">Declined</span>
                  )}
                </span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Hotel:</span>
                <span className="ml-2">{rsvp.hotel_choice?.replace(/_/g, ' ') || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BudgetSummaryWidget() {
  const [summary, setSummary] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    loadBudgetSummary();
  }, []);

  const loadBudgetSummary = async () => {
    try {
      const response = await fetch('/api/admin/budget/summary');
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Failed to load budget summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">Budget data not available</p>
        <p className="text-xs mt-2">Click "Manage Budget" to set up your budget</p>
      </div>
    );
  }

  const percentageSpent = summary.total_budget 
    ? (summary.total_spent / summary.total_budget) * 100 
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total Budget */}
      <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
        <p className="text-xs text-blue-600 font-medium mb-1">Total Budget</p>
        <p className="text-lg font-bold text-blue-700">
          {formatCurrency(summary.total_budget)}
        </p>
      </div>

      {/* Total Spent */}
      <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
        <p className="text-xs text-red-600 font-medium mb-1">Spent</p>
        <p className="text-lg font-bold text-red-700">
          {formatCurrency(summary.total_spent)}
        </p>
        <p className="text-xs text-red-600 mt-1">
          {percentageSpent.toFixed(1)}%
        </p>
      </div>

      {/* Remaining */}
      <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
        <p className="text-xs text-green-600 font-medium mb-1">Remaining</p>
        <p className="text-lg font-bold text-green-700">
          {formatCurrency(summary.total_remaining)}
        </p>
      </div>

      {/* Contributions */}
      <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-200">
        <p className="text-xs text-purple-600 font-medium mb-1">Contributions</p>
        <p className="text-lg font-bold text-purple-700">
          {formatCurrency(summary.total_contributions || 0)}
        </p>
        <p className="text-xs text-purple-600 mt-1">
          {summary.contributions_count || 0} verified
        </p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<'email' | 'otp' | 'authenticated'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<'super_admin' | 'event_planner'>('event_planner');
  const [rsvps, setRsvps] = useState<RSVPData[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    attending: 0,
    declined: 0,
    waitlisted: 0,
    totalPledges: 0
  });
  const [filter, setFilter] = useState<'all' | 'attending' | 'declined' | 'waitlisted'>('all');

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/admin/auth/verify-session');
      if (response.ok) {
        const data = await response.json();
        console.log('Session data:', data);
        if (data.valid) {
          setEmail(data.email);
          setUserRole(data.role || 'event_planner');
          setStep('authenticated');
          loadDashboard(data.email);
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
    }
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('otp');
        toast({
          title: 'Code Sent!',
          description: 'Check your email for the 6-digit code.',
        });
        
        if (data.otp) {
          console.log('🔐 DEV MODE - OTP:', data.otp);
          toast({
            title: 'DEV MODE',
            description: `OTP: ${data.otp}`,
            variant: 'default',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send OTP',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserRole(data.role || 'event_planner');
        setStep('authenticated');
        loadDashboard(email);
        toast({
          title: 'Success!',
          description: 'Welcome to the admin dashboard',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Invalid OTP',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      setStep('email');
      setEmail('');
      setOtp('');
      setRsvps([]);
      toast({
        title: 'Logged Out',
        description: 'Successfully logged out',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  const loadDashboard = async (adminEmail: string) => {
    try {
      const response = await fetch(`/api/admin/rsvps?email=${encodeURIComponent(adminEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setRsvps(data.rsvps || []);
        calculateStats(data.rsvps || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to load RSVPs',
        variant: 'destructive',
      });
    }
  };

  const calculateStats = (rsvpData: RSVPData[]) => {
    const attending = rsvpData.filter(r => r.attending && !r.is_waitlisted).length;
    const declined = rsvpData.filter(r => !r.attending).length;
    const waitlisted = rsvpData.filter(r => r.is_waitlisted).length;
    const totalPledges = rsvpData.reduce((sum, r) => sum + (r.pledge_amount || 0), 0);

    setStats({
      total: rsvpData.length,
      attending,
      declined,
      waitlisted,
      totalPledges
    });
  };

  const refreshRSVPs = () => {
    loadDashboard(email);
  };

  const filteredRSVPs = rsvps.filter(rsvp => {
    if (filter === 'all') return true;
    if (filter === 'attending') return rsvp.attending && !rsvp.is_waitlisted;
    if (filter === 'declined') return !rsvp.attending;
    if (filter === 'waitlisted') return rsvp.is_waitlisted;
    return true;
  });

  const handleExportCSV = () => {
    const headers = [
      'Name',
      'Email', 
      'Phone',
      'Status',
      'Hotel',
      'Message',
      'Dietary Needs',
      ...(userRole === 'super_admin' ? ['Pledge Amount'] : []),
      'RSVP Date'
    ];

    const rows = filteredRSVPs.map(rsvp => [
      rsvp.guest.name || 'N/A',
      rsvp.guest.email,
      rsvp.guest.phone || 'N/A',
      rsvp.is_waitlisted ? 'Waitlisted' : rsvp.attending ? 'Attending' : 'Declined',
      rsvp.hotel_choice?.replace(/_/g, ' ') || 'N/A',
      rsvp.note ? `"${rsvp.note.replace(/"/g, '""')}"` : 'N/A',
      rsvp.dietary_needs ? `"${rsvp.dietary_needs.replace(/"/g, '""')}"` : 'N/A',
      ...(userRole === 'super_admin' ? [rsvp.pledge_amount || '0'] : []),
      new Date(rsvp.created_at).toLocaleDateString()
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rsvp-list-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Login UI
  if (step === 'email') {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-mahogany-100 flex items-center justify-center">
              <Lock className="h-8 w-8 text-mahogany-600" />
            </div>
            <CardTitle className="text-mahogany-800">Admin Login</CardTitle>
            <CardDescription>Enter your admin email to receive a verification code</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Verification Code
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-mahogany-100 flex items-center justify-center">
              <Shield className="h-8 w-8 text-mahogany-600" />
            </div>
            <CardTitle className="text-mahogany-800">Enter Verification Code</CardTitle>
            <CardDescription>
              We sent a 6-digit code to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">6-Digit Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  disabled={loading}
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Login'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep('email')}
                disabled={loading}
              >
                Back to Email
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard UI
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-mahogany-800 mb-2">Wedding RSVP Dashboard</h1>
          <p className="text-muted-foreground">
            {userRole === 'super_admin' ? '🔑 Super Admin' : '👔 Event Planner'} • {email}
          </p>
        </div>
        <div className="flex gap-2">
          {userRole === 'super_admin' && (
            <>
              <Button variant="outline" onClick={() => router.push('/admin/manage-admins')}>
                <Shield className="h-4 w-4 mr-2" />
                Manage Admins
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/phone-whitelist')}>
                <Users className="h-4 w-4 mr-2" />
                Phone Whitelist
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/hotels')}>
                Hotels
              </Button>
            </>
          )}
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total RSVPs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.attending}</p>
                  <p className="text-xs text-muted-foreground">Attending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.declined}</p>
                  <p className="text-xs text-muted-foreground">Declined</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{stats.waitlisted}</p>
                  <p className="text-xs text-muted-foreground">Waitlisted</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Total Pledges - Super Admin Only */}
        {userRole === 'super_admin' && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-mahogany-700">
                    KES {stats.totalPledges.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Gift Pledges</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Budget Summary - Super Admin Only */}
        {userRole === 'super_admin' && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Budget Overview
                  </CardTitle>
                  <CardDescription>Financial summary and tracking</CardDescription>
                </div>
                <Button onClick={() => router.push('/admin/budget')}>
                  Manage Budget
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <BudgetSummaryWidget />
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All ({stats.total})
                </Button>
                <Button
                  variant={filter === 'attending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('attending')}
                >
                  Attending ({stats.attending})
                </Button>
                <Button
                  variant={filter === 'declined' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('declined')}
                >
                  Declined ({stats.declined})
                </Button>
                <Button
                  variant={filter === 'waitlisted' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('waitlisted')}
                >
                  Waitlisted ({stats.waitlisted})
                </Button>
              </div>
              <Button onClick={handleExportCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Guest List Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-mahogany-800">Guest List ({filteredRSVPs.length})</CardTitle>
            <CardDescription>Click "View" to see full messages and dietary requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-bronze-100">
                    <th className="text-left p-3 text-sm font-semibold text-mahogany-800">Name</th>
                    <th className="text-left p-3 text-sm font-semibold text-mahogany-800">Email</th>
                    <th className="text-left p-3 text-sm font-semibold text-mahogany-800">Phone</th>
                    <th className="text-left p-3 text-sm font-semibold text-mahogany-800">Status</th>
                    <th className="text-left p-3 text-sm font-semibold text-mahogany-800">Hotel</th>
                    <th className="text-left p-3 text-sm font-semibold text-mahogany-800">Message</th>
                    {userRole === 'super_admin' && (
                      <th className="text-left p-3 text-sm font-semibold text-mahogany-800">Pledge</th>
                    )}
                    <th className="text-left p-3 text-sm font-semibold text-mahogany-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRSVPs.map((rsvp) => (
                    <tr key={rsvp.id} className="border-b border-bronze-50 hover:bg-bronze-50/50">
                      <td className="p-3 text-sm">{rsvp.guest.name || 'N/A'}</td>
                      <td className="p-3 text-sm text-muted-foreground">{rsvp.guest.email}</td>
                      <td className="p-3 text-sm text-muted-foreground">{rsvp.guest.phone || 'N/A'}</td>
                      <td className="p-3">
                        {rsvp.is_waitlisted ? (
                          <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                            Waitlisted
                          </span>
                        ) : rsvp.attending ? (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            Attending
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                            Declined
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {rsvp.hotel_choice?.replace(/_/g, ' ') || 'N/A'}
                      </td>
                      <td className="p-3">
                        <MessageViewerModal rsvp={rsvp} />
                      </td>
                      {userRole === 'super_admin' && (
                        <td className="p-3 text-sm font-medium text-mahogany-700">
                          {rsvp.pledge_amount ? `KES ${rsvp.pledge_amount.toLocaleString()}` : '-'}
                        </td>
                      )}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {userRole === 'super_admin' ? (
                            <>
                              <EditRSVPModal
                                rsvp={rsvp}
                                guest={rsvp.guest}
                                onSuccess={refreshRSVPs}
                                adminEmail={email}
                              />
                              <DeleteGuestButton
                                guestId={rsvp.guest.id}
                                guestName={rsvp.guest.name}
                                guestEmail={rsvp.guest.email}
                                adminEmail={email}
                                onSuccess={refreshRSVPs}
                              />
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground px-2 py-1 bg-gray-50 rounded">
                              View Only
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}