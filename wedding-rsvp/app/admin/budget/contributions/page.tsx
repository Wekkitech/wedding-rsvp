'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  ArrowLeft, 
  Plus, 
  CheckCircle, 
  Clock,
  Users,
  DollarSign
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

interface Contribution {
  id: string;
  amount: number;
  contribution_date: string;
  payment_method: string;
  transaction_reference?: string;
  notes?: string;
  verified: boolean;
  verified_by?: string;
  verified_at?: string;
  guest: {
    name: string;
    email: string;
    phone: string;
  };
  rsvp: {
    pledge_amount: number;
    pledge_fulfilled: boolean;
  };
}

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface RSVP {
  id: string;
  guest_id: string;
  pledge_amount: number;
  attending: boolean;
}

export default function ContributionTrackingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');

  const [contributionForm, setContributionForm] = useState({
    guest_id: '',
    rsvp_id: '',
    amount: '',
    contribution_date: new Date().toISOString().split('T')[0],
    payment_method: 'mpesa',
    transaction_reference: '',
    notes: ''
  });

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const response = await fetch('/api/admin/auth/verify-session');
      if (response.ok) {
        const authData = await response.json();
        if (authData.valid && authData.role === 'super_admin') {
          loadData();
        } else {
          toast({
            title: 'Access Denied',
            description: 'Only super admins can track contributions.',
            variant: 'destructive',
          });
          router.push('/admin/budget');
        }
      } else {
        router.push('/admin');
      }
    } catch (error) {
      router.push('/admin');
    }
  };

  const loadData = async () => {
    try {
      const [contributionsRes, rsvpsRes] = await Promise.all([
        fetch('/api/admin/budget/contributions'),
        fetch('/api/admin/rsvps?email=admin@example.com') // Get all RSVPs with guests
      ]);

      const contributionsData = await contributionsRes.json();
      const rsvpsData = await rsvpsRes.json();

      setContributions(contributionsData.contributions || []);
      setRsvps(rsvpsData.rsvps || []);
      
      // Extract unique guests from RSVPs
      const uniqueGuests = rsvpsData.rsvps?.map((rsvp: any) => rsvp.guest) || [];
      setGuests(uniqueGuests);

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load contributions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/budget/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contributionForm,
          amount: parseFloat(contributionForm.amount),
        }),
      });

      if (response.ok) {
        toast({
          title: 'Contribution Added',
          description: 'Contribution has been recorded successfully.',
        });
        setIsAddOpen(false);
        resetForm();
        loadData();
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'Failed to add contribution',
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
      setSubmitting(false);
    }
  };

  const handleVerifyContribution = async (contribution: Contribution) => {
    if (!confirm(`Verify contribution of ${formatCurrency(contribution.amount)} from ${contribution.guest.name}?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/budget/contributions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: contribution.id }),
      });

      if (response.ok) {
        toast({
          title: 'Contribution Verified',
          description: 'Contribution has been verified and pledge marked as fulfilled.',
        });
        loadData();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to verify contribution',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleGuestChange = (guestId: string) => {
    setContributionForm({ ...contributionForm, guest_id: guestId });
    
    // Find matching RSVP
    const matchingRsvp = rsvps.find(r => r.guest_id === guestId && r.attending);
    if (matchingRsvp) {
      setContributionForm(prev => ({
        ...prev,
        guest_id: guestId,
        rsvp_id: matchingRsvp.id,
        amount: matchingRsvp.pledge_amount?.toString() || ''
      }));
    }
  };

  const resetForm = () => {
    setContributionForm({
      guest_id: '',
      rsvp_id: '',
      amount: '',
      contribution_date: new Date().toISOString().split('T')[0],
      payment_method: 'mpesa',
      transaction_reference: '',
      notes: ''
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-mahogany-600" />
      </div>
    );
  }

  const filteredContributions = contributions.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'verified') return c.verified;
    if (filter === 'pending') return !c.verified;
    return true;
  });

  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
  const verifiedAmount = contributions.filter(c => c.verified).reduce((sum, c) => sum + c.amount, 0);
  const pendingAmount = contributions.filter(c => !c.verified).reduce((sum, c) => sum + c.amount, 0);
  const totalPledged = rsvps.reduce((sum, r) => sum + (r.pledge_amount || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/budget')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Budget
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif text-mahogany-800 mb-2">Contribution Tracking</h1>
            <p className="text-bronze-600">Verify guest contributions and track pledges</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Record Contribution
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Record Guest Contribution</DialogTitle>
                <DialogDescription>Manually record an M-Pesa or cash contribution</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddContribution} className="space-y-4">
                <div>
                  <Label htmlFor="guest">Guest *</Label>
                  <Select 
                    value={contributionForm.guest_id} 
                    onValueChange={handleGuestChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select guest" />
                    </SelectTrigger>
                    <SelectContent>
                      {guests.map((guest) => (
                        <SelectItem key={guest.id} value={guest.id}>
                          {guest.name} - {guest.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {contributionForm.guest_id && (
                  <>
                    {rsvps.find(r => r.guest_id === contributionForm.guest_id)?.pledge_amount && (
                      <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>Pledged Amount:</strong> {formatCurrency(
                            rsvps.find(r => r.guest_id === contributionForm.guest_id)?.pledge_amount || 0
                          )}
                        </p>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="amount">Contribution Amount (KES) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={contributionForm.amount}
                        onChange={(e) => setContributionForm({ ...contributionForm, amount: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="date">Contribution Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={contributionForm.contribution_date}
                        onChange={(e) => setContributionForm({ ...contributionForm, contribution_date: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="method">Payment Method *</Label>
                      <Select 
                        value={contributionForm.payment_method} 
                        onValueChange={(value) => setContributionForm({ ...contributionForm, payment_method: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mpesa">M-Pesa</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="reference">Transaction Reference</Label>
                      <Input
                        id="reference"
                        value={contributionForm.transaction_reference}
                        onChange={(e) => setContributionForm({ ...contributionForm, transaction_reference: e.target.value })}
                        placeholder="e.g., M-Pesa code"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={contributionForm.notes}
                        onChange={(e) => setContributionForm({ ...contributionForm, notes: e.target.value })}
                        rows={2}
                      />
                    </div>
                  </>
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting || !contributionForm.guest_id}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Recording...
                      </>
                    ) : (
                      'Record Contribution'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Pledged</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalPledged)}</p>
            <p className="text-xs text-muted-foreground mt-1">{rsvps.filter(r => r.pledge_amount).length} guests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Verified Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(verifiedAmount)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {contributions.filter(c => c.verified).length} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {contributions.filter(c => !c.verified).length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">
              {totalPledged > 0 ? ((verifiedAmount / totalPledged) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">of pledged amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({contributions.length})
        </Button>
        <Button
          variant={filter === 'verified' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('verified')}
        >
          Verified ({contributions.filter(c => c.verified).length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('pending')}
        >
          Pending ({contributions.filter(c => !c.verified).length})
        </Button>
      </div>

      {/* Contributions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contributions ({filteredContributions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-semibold">Guest</th>
                  <th className="text-left p-3 text-sm font-semibold">Amount</th>
                  <th className="text-left p-3 text-sm font-semibold">Pledged</th>
                  <th className="text-left p-3 text-sm font-semibold">Date</th>
                  <th className="text-left p-3 text-sm font-semibold">Method</th>
                  <th className="text-left p-3 text-sm font-semibold">Reference</th>
                  <th className="text-left p-3 text-sm font-semibold">Status</th>
                  <th className="text-left p-3 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContributions.map((contribution) => (
                  <tr key={contribution.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{contribution.guest.name}</p>
                        <p className="text-xs text-muted-foreground">{contribution.guest.phone}</p>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-green-600">
                      {formatCurrency(contribution.amount)}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {formatCurrency(contribution.rsvp.pledge_amount)}
                    </td>
                    <td className="p-3 text-sm">{formatDate(contribution.contribution_date)}</td>
                    <td className="p-3">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {contribution.payment_method.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {contribution.transaction_reference || '-'}
                    </td>
                    <td className="p-3">
                      {contribution.verified ? (
                        <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {!contribution.verified && (
                        <Button
                          size="sm"
                          onClick={() => handleVerifyContribution(contribution)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                      )}
                      {contribution.verified && (
                        <span className="text-xs text-green-600">
                          ✓ By {contribution.verified_by}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredContributions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No contributions found</p>
                <p className="text-sm mt-2">Start by recording a guest contribution</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}