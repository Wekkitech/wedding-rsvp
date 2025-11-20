//budget/vendors page
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
  Edit, 
  Trash2, 
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle
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

interface Vendor {
  id: string;
  name: string;
  category?: { name: string; color: string };
  contact_person?: string;
  phone?: string;
  email?: string;
  contract_amount: number;
  amount_paid: number;
  balance: number;
  payment_status: string;
  contract_date?: string;
  payment_due_date?: string;
  notes?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

export default function VendorManagementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [vendorForm, setVendorForm] = useState({
    name: '',
    category_id: '',
    contact_person: '',
    phone: '',
    email: '',
    description: '',
    contract_amount: '',
    contract_date: '',
    payment_due_date: '',
    notes: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
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
            description: 'Only super admins can manage vendors.',
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
      const [vendorsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/budget/vendors'),
        fetch('/api/admin/budget/categories')
      ]);

      const vendorsData = await vendorsRes.json();
      const categoriesData = await categoriesRes.json();

      setVendors(vendorsData.vendors || []);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load vendors',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/budget/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...vendorForm,
          contract_amount: parseFloat(vendorForm.contract_amount),
          category_id: vendorForm.category_id || null,
          contract_date: vendorForm.contract_date || null,
          payment_due_date: vendorForm.payment_due_date || null
        }),
      });

      if (response.ok) {
        toast({
          title: 'Vendor Added',
          description: 'Vendor has been added successfully.',
        });
        setIsAddOpen(false);
        resetVendorForm();
        loadData();
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'Failed to add vendor',
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

  const handleEditVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/budget/vendors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedVendor.id,
          ...vendorForm,
          contract_amount: parseFloat(vendorForm.contract_amount),
          category_id: vendorForm.category_id || null,
          contract_date: vendorForm.contract_date || null,
          payment_due_date: vendorForm.payment_due_date || null
        }),
      });

      if (response.ok) {
        toast({
          title: 'Vendor Updated',
          description: 'Vendor has been updated successfully.',
        });
        setIsEditOpen(false);
        setSelectedVendor(null);
        resetVendorForm();
        loadData();
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'Failed to update vendor',
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

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/budget/vendors/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: selectedVendor.id,
          amount: parseFloat(paymentForm.amount),
          payment_date: paymentForm.payment_date,
          payment_method: paymentForm.payment_method,
          transaction_reference: paymentForm.transaction_reference || null,
          notes: paymentForm.notes || null
        }),
      });

      if (response.ok) {
        toast({
          title: 'Payment Recorded',
          description: 'Payment has been recorded successfully.',
        });
        setIsPaymentOpen(false);
        setSelectedVendor(null);
        resetPaymentForm();
        loadData();
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'Failed to record payment',
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

  const handleDeleteVendor = async (vendor: Vendor) => {
    if (!confirm(`Are you sure you want to delete ${vendor.name}?`)) return;

    try {
      const response = await fetch(`/api/admin/budget/vendors?id=${vendor.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Vendor Deleted',
          description: 'Vendor has been removed.',
        });
        loadData();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete vendor',
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

  const resetVendorForm = () => {
    setVendorForm({
      name: '',
      category_id: '',
      contact_person: '',
      phone: '',
      email: '',
      description: '',
      contract_amount: '',
      contract_date: '',
      payment_due_date: '',
      notes: ''
    });
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'mpesa',
      transaction_reference: '',
      notes: ''
    });
  };

  const openEditDialog = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setVendorForm({
      name: vendor.name,
      category_id: vendor.category?.name || '',
      contact_person: vendor.contact_person || '',
      phone: vendor.phone || '',
      email: vendor.email || '',
      description: '',
      contract_amount: vendor.contract_amount.toString(),
      contract_date: vendor.contract_date || '',
      payment_due_date: vendor.payment_due_date || '',
      notes: vendor.notes || ''
    });
    setIsEditOpen(true);
  };

  const openPaymentDialog = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setPaymentForm({
      ...paymentForm,
      amount: vendor.balance.toString()
    });
    setIsPaymentOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
            <CheckCircle className="h-3 w-3" />
            Paid
          </span>
        );
      case 'partial':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
            <Clock className="h-3 w-3" />
            Partial
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
            <AlertCircle className="h-3 w-3" />
            Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-mahogany-600" />
      </div>
    );
  }

  const totalContract = vendors.reduce((sum, v) => sum + v.contract_amount, 0);
  const totalPaid = vendors.reduce((sum, v) => sum + v.amount_paid, 0);
  const totalBalance = vendors.reduce((sum, v) => sum + v.balance, 0);

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
            <h1 className="text-4xl font-serif text-mahogany-800 mb-2">Vendor Management</h1>
            <p className="text-bronze-600">Track and manage wedding vendors and payments</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Vendor</DialogTitle>
                <DialogDescription>Enter the vendor details below</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddVendor} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Vendor Name *</Label>
                    <Input
                      id="name"
                      value={vendorForm.name}
                      onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={vendorForm.category_id} onValueChange={(value) => setVendorForm({ ...vendorForm, category_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="contract_amount">Contract Amount (KES) *</Label>
                    <Input
                      id="contract_amount"
                      type="number"
                      value={vendorForm.contract_amount}
                      onChange={(e) => setVendorForm({ ...vendorForm, contract_amount: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact_person">Contact Person</Label>
                    <Input
                      id="contact_person"
                      value={vendorForm.contact_person}
                      onChange={(e) => setVendorForm({ ...vendorForm, contact_person: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={vendorForm.phone}
                      onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={vendorForm.email}
                      onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contract_date">Contract Date</Label>
                    <Input
                      id="contract_date"
                      type="date"
                      value={vendorForm.contract_date}
                      onChange={(e) => setVendorForm({ ...vendorForm, contract_date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="payment_due_date">Payment Due Date</Label>
                    <Input
                      id="payment_due_date"
                      type="date"
                      value={vendorForm.payment_due_date}
                      onChange={(e) => setVendorForm({ ...vendorForm, payment_due_date: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={vendorForm.notes}
                      onChange={(e) => setVendorForm({ ...vendorForm, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Vendor'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Contract Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalContract)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Balance Due</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalBalance)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendors ({vendors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-semibold">Vendor</th>
                  <th className="text-left p-3 text-sm font-semibold">Category</th>
                  <th className="text-left p-3 text-sm font-semibold">Contract</th>
                  <th className="text-left p-3 text-sm font-semibold">Paid</th>
                  <th className="text-left p-3 text-sm font-semibold">Balance</th>
                  <th className="text-left p-3 text-sm font-semibold">Status</th>
                  <th className="text-left p-3 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{vendor.name}</p>
                        {vendor.contact_person && (
                          <p className="text-xs text-muted-foreground">{vendor.contact_person}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {vendor.category && (
                        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: `${vendor.category.color}20`, color: vendor.category.color }}>
                          {vendor.category.name}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-medium">{formatCurrency(vendor.contract_amount)}</td>
                    <td className="p-3 text-green-600">{formatCurrency(vendor.amount_paid)}</td>
                    <td className="p-3 text-red-600">{formatCurrency(vendor.balance)}</td>
                    <td className="p-3">{getStatusBadge(vendor.payment_status)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openPaymentDialog(vendor)}
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(vendor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteVendor(vendor)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Vendor Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
            <DialogDescription>Update vendor details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditVendor} className="space-y-4">
            {/* Same form fields as Add Vendor */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="edit-name">Vendor Name *</Label>
                <Input
                  id="edit-name"
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-contract_amount">Contract Amount (KES) *</Label>
                <Input
                  id="edit-contract_amount"
                  type="number"
                  value={vendorForm.contract_amount}
                  onChange={(e) => setVendorForm({ ...vendorForm, contract_amount: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-contact_person">Contact Person</Label>
                <Input
                  id="edit-contact_person"
                  value={vendorForm.contact_person}
                  onChange={(e) => setVendorForm({ ...vendorForm, contact_person: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={vendorForm.phone}
                  onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={vendorForm.email}
                  onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                />
              </div>

              <div className="col-span-2">
  <Label htmlFor="edit-category">Category</Label>
  <Select value={vendorForm.category_id} onValueChange={(value) => setVendorForm({ ...vendorForm, category_id: value })}>
    <SelectTrigger>
      <SelectValue placeholder="Select category" />
    </SelectTrigger>
    <SelectContent>
      {categories.map((cat) => (
        <SelectItem key={cat.id} value={cat.id}>
          {cat.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

              <div className="col-span-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={vendorForm.notes}
                  onChange={(e) => setVendorForm({ ...vendorForm, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Vendor'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for {selectedVendor?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div>
              <Label>Balance Due</Label>
              <p className="text-2xl font-bold text-red-600">
                {selectedVendor && formatCurrency(selectedVendor.balance)}
              </p>
            </div>

            <div>
              <Label htmlFor="payment-amount">Payment Amount (KES) *</Label>
              <Input
                id="payment-amount"
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="payment-date">Payment Date *</Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentForm.payment_date}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="payment-method">Payment Method *</Label>
              <Select value={paymentForm.payment_method} onValueChange={(value) => setPaymentForm({ ...paymentForm, payment_method: value })}>
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

            <div>
              <Label htmlFor="transaction-ref">Transaction Reference</Label>
              <Input
                id="transaction-ref"
                value={paymentForm.transaction_reference}
                onChange={(e) => setPaymentForm({ ...paymentForm, transaction_reference: e.target.value })}
                placeholder="e.g., M-Pesa code"
              />
            </div>

            <div>
              <Label htmlFor="payment-notes">Notes</Label>
              <Textarea
                id="payment-notes"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPaymentOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  'Record Payment'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}