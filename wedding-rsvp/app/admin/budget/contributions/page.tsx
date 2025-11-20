'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Check,
  Download,
  CheckCircle,
  Clock,
  User,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Contribution {
  id: string;
  contribution_type: 'guest' | 'external';
  name: string;
  phone: string;
  amount: number;
  payment_method: string;
  mpesa_code: string;
  contribution_date: string;
  verified: boolean;
  verified_by?: string;
  verified_at?: string;
  notes?: string;
}

interface Guest {
  id: string;
  name: string;
  phone: string;
  pledge_amount: number;
  attending: boolean;
}

export default function ContributionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const [filterType, setFilterType] = useState<'all' | 'guest' | 'external'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending'>('all');
  
  const [addGuestDialog, setAddGuestDialog] = useState(false);
  const [addExternalDialog, setAddExternalDialog] = useState(false);
  const [addingGuest, setAddingGuest] = useState(false);
  const [addingExternal, setAddingExternal] = useState(false);
  
  const [guestForm, setGuestForm] = useState({
    guest_id: '',
    amount: '',
    payment_method: 'mpesa',
    mpesa_code: '',
    notes: '',
  });

  const [externalForm, setExternalForm] = useState({
    name: '',
    phone: '',
    email: '',
    amount: '',
    payment_method: 'mpesa',
    mpesa_code: '',
    notes: '',
  });

  // Get selected guest and their pledge info
  const selectedGuest = guests.find(g => g.id === guestForm.guest_id);
  const contributionAmount = parseFloat(guestForm.amount) || 0;
  const stillOwes = selectedGuest ? Math.max(0, selectedGuest.pledge_amount - contributionAmount) : 0;
  const overContributed = selectedGuest && selectedGuest.pledge_amount > 0 ? 
    Math.max(0, contributionAmount - selectedGuest.pledge_amount) : 0;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load contributions
      const contribResponse = await fetch('/api/admin/budget/contributions');
      if (contribResponse.ok) {
        const contribData = await contribResponse.json();
        setContributions(contribData.contributions || []);
      }

      // Load guests (with pledge info)
      const guestsResponse = await fetch('/api/guests');
      if (guestsResponse.ok) {
        const guestsData = await guestsResponse.json();
        if (guestsData.guests) {
          setGuests(guestsData.guests);
        }
      } else if (guestsResponse.status === 404) {
        console.warn('Guests API not found - continue without guest list');
      }
    } catch (error) {
      console.error('Error loading data:', error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE');
  };

  const filteredContributions = contributions.filter(c => {
    if (filterType !== 'all' && c.contribution_type !== filterType) return false;
    if (filterStatus === 'verified' && !c.verified) return false;
    if (filterStatus === 'pending' && c.verified) return false;
    return true;
  });

  const stats = {
    total: filteredContributions.length,
    verified: filteredContributions.filter(c => c.verified).length,
    pending: filteredContributions.filter(c => !c.verified).length,
    totalAmount: filteredContributions.reduce((sum, c) => sum + (c.amount || 0), 0),
    verifiedAmount: filteredContributions.filter(c => c.verified).reduce((sum, c) => sum + (c.amount || 0), 0),
    pendingAmount: filteredContributions.filter(c => !c.verified).reduce((sum, c) => sum + (c.amount || 0), 0),
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredContributions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContributions.map(c => c.id)));
    }
  };

  const handleAddGuest = async () => {
    if (!guestForm.guest_id || !guestForm.amount) {
      toast({
        title: 'Validation Error',
        description: 'Guest and amount are required',
        variant: 'destructive',
      });
      return;
    }

    setAddingGuest(true);
    try {
      const response = await fetch('/api/admin/budget/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'guest',
          guest_id: guestForm.guest_id,
          amount: parseFloat(guestForm.amount),
          payment_method: guestForm.payment_method,
          mpesa_code: guestForm.mpesa_code,
          notes: guestForm.notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Guest contribution added',
        });
        setAddGuestDialog(false);
        setGuestForm({
          guest_id: '',
          amount: '',
          payment_method: 'mpesa',
          mpesa_code: '',
          notes: '',
        });
        loadData();
      } else {
        toast({
          title: 'Error',
          description: data.error || data.details || 'Failed to add contribution',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: String(error),
        variant: 'destructive',
      });
    } finally {
      setAddingGuest(false);
    }
  };

  const handleAddExternal = async () => {
    if (!externalForm.name || !externalForm.amount) {
      toast({
        title: 'Validation Error',
        description: 'Name and amount are required',
        variant: 'destructive',
      });
      return;
    }

    setAddingExternal(true);
    try {
      const response = await fetch('/api/admin/budget/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'external',
          name: externalForm.name,
          phone: externalForm.phone,
          email: externalForm.email,
          amount: parseFloat(externalForm.amount),
          payment_method: externalForm.payment_method,
          mpesa_code: externalForm.mpesa_code,
          notes: externalForm.notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'External contribution added',
        });
        setAddExternalDialog(false);
        setExternalForm({
          name: '',
          phone: '',
          email: '',
          amount: '',
          payment_method: 'mpesa',
          mpesa_code: '',
          notes: '',
        });
        loadData();
      } else {
        toast({
          title: 'Error',
          description: data.error || data.details || 'Failed to add contribution',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: String(error),
        variant: 'destructive',
      });
    } finally {
      setAddingExternal(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/budget/contributions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: true }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Contribution verified',
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

  const handleBulkVerify = async () => {
    if (selectedIds.size === 0) return;

    try {
      const response = await fetch('/api/admin/budget/contributions/bulk-verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Verified ${selectedIds.size} contributions`,
        });
        setSelectedIds(new Set());
        loadData();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to verify contributions',
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

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contribution?')) return;

    try {
      const response = await fetch(`/api/admin/budget/contributions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Contribution deleted',
        });
        loadData();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete contribution',
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-mahogany-600" />
      </div>
    );
  }

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

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-serif text-mahogany-800 mb-2">Track Contributions</h1>
            <p className="text-bronze-600">Manage guest and external contributions</p>
          </div>
          <Button onClick={() => {}} disabled>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-mahogany-700">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
              <p className="text-xs text-muted-foreground">Verified</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-lg font-bold text-green-600">{formatCurrency(stats.verifiedAmount)}</div>
              <p className="text-xs text-muted-foreground">Verified</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-lg font-bold text-blue-600">{formatCurrency(stats.totalAmount)}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Dialog open={addGuestDialog} onOpenChange={setAddGuestDialog}>
          <DialogTrigger asChild>
            <Button className="bg-mahogany-600 hover:bg-mahogany-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Guest Contribution
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Guest Contribution</DialogTitle>
              <DialogDescription>
                Record a contribution from someone who RSVP'd
              </DialogDescription>
            </DialogHeader>

            {guests.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">No guests loaded</p>
                  <p>Enter guest details manually below</p>
                </div>
              </div>
            ) : null}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Guest *</Label>
                <Select value={guestForm.guest_id} onValueChange={(value) => setGuestForm({ ...guestForm, guest_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={guests.length === 0 ? "No guests available" : "Choose guest..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {guests.map(guest => (
                      <SelectItem key={guest.id} value={guest.id}>
                        {guest.name} ({guest.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedGuest && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-2">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Pledged:</span>
                        <span className="font-semibold text-blue-900">{formatCurrency(selectedGuest.pledge_amount)}</span>
                      </div>
                      {contributionAmount > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Contributing:</span>
                            <span className="font-semibold text-blue-900">{formatCurrency(contributionAmount)}</span>
                          </div>
                          <div className="border-t border-blue-200 pt-1 mt-1 flex justify-between">
                            <span className="text-blue-700">
                              {stillOwes > 0 ? 'Still owes:' : 'Over contributed:'}
                            </span>
                            <span className={`font-semibold ${stillOwes > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {stillOwes > 0 ? formatCurrency(stillOwes) : formatCurrency(overContributed)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Amount (KES) *</Label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={guestForm.amount}
                  onChange={(e) => setGuestForm({ ...guestForm, amount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={guestForm.payment_method} onValueChange={(value) => setGuestForm({ ...guestForm, payment_method: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>M-Pesa/Reference Code</Label>
                <Input
                  placeholder="e.g., LN123456789"
                  value={guestForm.mpesa_code}
                  onChange={(e) => setGuestForm({ ...guestForm, mpesa_code: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Additional notes..."
                  value={guestForm.notes}
                  onChange={(e) => setGuestForm({ ...guestForm, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAddGuestDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddGuest} 
                className="bg-mahogany-600 hover:bg-mahogany-700"
                disabled={addingGuest}
              >
                {addingGuest ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Add Contribution
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={addExternalDialog} onOpenChange={setAddExternalDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add External Contributor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add External Contribution</DialogTitle>
              <DialogDescription>
                Record a contribution from someone not on the guest list
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  placeholder="Contributor name"
                  value={externalForm.name}
                  onChange={(e) => setExternalForm({ ...externalForm, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  placeholder="+2547XXXXXXXX"
                  value={externalForm.phone}
                  onChange={(e) => setExternalForm({ ...externalForm, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={externalForm.email}
                  onChange={(e) => setExternalForm({ ...externalForm, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Amount (KES) *</Label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={externalForm.amount}
                  onChange={(e) => setExternalForm({ ...externalForm, amount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={externalForm.payment_method} onValueChange={(value) => setExternalForm({ ...externalForm, payment_method: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>M-Pesa/Reference Code</Label>
                <Input
                  placeholder="e.g., LN123456789"
                  value={externalForm.mpesa_code}
                  onChange={(e) => setExternalForm({ ...externalForm, mpesa_code: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Additional notes..."
                  value={externalForm.notes}
                  onChange={(e) => setExternalForm({ ...externalForm, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAddExternalDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddExternal} 
                className="bg-mahogany-600 hover:bg-mahogany-700"
                disabled={addingExternal}
              >
                {addingExternal ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Add Contribution
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {selectedIds.size > 0 && (
          <Button
            variant="default"
            onClick={handleBulkVerify}
            className="bg-green-600 hover:bg-green-700 ml-auto"
          >
            <Check className="mr-2 h-4 w-4" />
            Verify {selectedIds.size}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Contributions</SelectItem>
            <SelectItem value="guest">Guest Only</SelectItem>
            <SelectItem value="external">External Only</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contributions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contributions</CardTitle>
          <CardDescription>
            {filteredContributions.length} found - {formatCurrency(stats.totalAmount)} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-bronze-100">
                  <th className="text-left p-3 w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredContributions.length && filteredContributions.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded"
                    />
                  </th>
                  <th className="text-left p-3 font-semibold">Type</th>
                  <th className="text-left p-3 font-semibold">Name</th>
                  <th className="text-left p-3 font-semibold">Amount</th>
                  <th className="text-left p-3 font-semibold">Payment</th>
                  <th className="text-left p-3 font-semibold">Date</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContributions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No contributions found
                    </td>
                  </tr>
                ) : (
                  filteredContributions.map((contribution) => (
                    <tr
                      key={contribution.id}
                      className={`border-b border-bronze-50 hover:bg-bronze-50/50 ${
                        selectedIds.has(contribution.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(contribution.id)}
                          onChange={() => toggleSelection(contribution.id)}
                          className="w-4 h-4 rounded"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {contribution.contribution_type === 'guest' ? (
                            <User className="h-4 w-4 text-blue-600" />
                          ) : (
                            <ExternalLink className="h-4 w-4 text-purple-600" />
                          )}
                          <span className="text-sm capitalize">{contribution.contribution_type}</span>
                        </div>
                      </td>
                      <td className="p-3 font-medium">{contribution.name}</td>
                      <td className="p-3 font-semibold">{formatCurrency(contribution.amount)}</td>
                      <td className="p-3 text-sm">
                        <div>{contribution.payment_method}</div>
                        {contribution.mpesa_code && (
                          <div className="text-xs text-muted-foreground">{contribution.mpesa_code}</div>
                        )}
                      </td>
                      <td className="p-3 text-sm">{formatDate(contribution.contribution_date)}</td>
                      <td className="p-3">
                        {contribution.verified ? (
                          <div className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="h-4 w-4" />
                            Verified
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-yellow-600 text-sm">
                            <Clock className="h-4 w-4" />
                            Pending
                          </div>
                        )}
                      </td>
                      <td className="p-3 flex gap-2">
                        {!contribution.verified && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleVerify(contribution.id)}
                            className="text-green-600 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(contribution.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}