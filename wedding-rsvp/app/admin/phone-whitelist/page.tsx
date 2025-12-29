'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Phone, Plus, Trash2, Loader2, Upload, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface WhitelistEntry {
  id: string;
  phone: string;
  name: string | null;
  notes: string | null;
  added_by: string | null;
  created_at: string;
}

export default function PhoneWhitelistPage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<WhitelistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    notes: '',
  });

  const [bulkData, setBulkData] = useState('');

  // Get admin email from localStorage
  const getAdminEmail = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminEmail');
    }
    return null;
  };

  useEffect(() => {
    loadWhitelist();
  }, []);

  const loadWhitelist = async () => {
    const adminEmail = getAdminEmail();
    if (!adminEmail) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/phone-whitelist?email=${adminEmail}`);
      const data = await response.json();
      
      if (response.ok) {
        setEntries(data.entries || []);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to load whitelist",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load whitelist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ phone: '', name: '', notes: '' });
    setEditingId(null);
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
    if (selectedIds.size === entries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(entries.map(e => e.id)));
    }
  };

  const openEditDialog = (entry: WhitelistEntry) => {
    setFormData({
      phone: entry.phone,
      name: entry.name || '',
      notes: entry.notes || '',
    });
    setEditingId(entry.id);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const adminEmail = getAdminEmail();
    
    if (!formData.phone) {
      toast({
        title: "Validation Error",
        description: "Phone number is required",
        variant: "destructive",
      });
      return;
    }

    if (!/^\+2547[0-9]{8}$/.test(formData.phone)) {
      toast({
        title: "Invalid Format",
        description: "Phone must be in format: +2547XXXXXXXX",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/phone-whitelist', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail,
          id: editingId,
          phone: formData.phone,
          name: formData.name || null,
          notes: formData.notes || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: editingId ? "Phone number updated" : "Phone number added to whitelist",
        });
        setDialogOpen(false);
        resetForm();
        loadWhitelist();
      } else {
        toast({
          title: "Error",
          description: data.error || (editingId ? "Failed to update phone number" : "Failed to add phone number"),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleBulkAdd = async () => {
    const adminEmail = getAdminEmail();
    
    if (!bulkData.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter phone numbers",
        variant: "destructive",
      });
      return;
    }

    const lines = bulkData.trim().split('\n');
    const phones = lines.map(line => {
      const [phone, name, notes] = line.split(',').map(s => s.trim());
      return { phone, name: name || null, notes: notes || null };
    });

    try {
      const response = await fetch('/api/admin/phone-whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail,
          bulk: true,
          phones,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: `Added ${data.added} phone number(s) to whitelist`,
        });
        setBulkDialogOpen(false);
        setBulkData('');
        loadWhitelist();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add phone numbers",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    const adminEmail = getAdminEmail();
    if (selectedIds.size === 0) return;
    
    if (!confirm(`Delete ${selectedIds.size} phone number(s) from whitelist?`)) return;

    try {
      const response = await fetch('/api/admin/phone-whitelist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          adminEmail, 
          ids: Array.from(selectedIds)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: `Deleted ${selectedIds.size} phone number(s)`,
        });
        setSelectedIds(new Set());
        loadWhitelist();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete phone numbers",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, phone: string) => {
    const adminEmail = getAdminEmail();
    if (!confirm(`Remove ${phone} from whitelist?`)) return;

    try {
      const response = await fetch('/api/admin/phone-whitelist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail, id }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Phone number removed from whitelist",
        });
        loadWhitelist();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete phone number",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-mahogany-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-mahogany-800 mb-2">Phone Whitelist</h1>
          <p className="text-bronze-600">Manage guest phone numbers (70 max capacity)</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-mahogany-700">{entries.length}</p>
                  <p className="text-sm text-muted-foreground">Whitelisted Numbers</p>
                </div>
                <Phone className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-orange-600">{70 - entries.length}</p>
                  <p className="text-sm text-muted-foreground">Spots Remaining</p>
                </div>
                <Phone className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-mahogany-600 hover:bg-mahogany-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Single Number
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Phone Number' : 'Add Phone Number'}</DialogTitle>
                <DialogDescription>
                  {editingId ? 'Update the guest phone number details' : 'Add a guest phone number to the whitelist'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="+2547XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Format: +2547XXXXXXXX</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Guest Name (Optional)</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="e.g., Family, Friend, Colleague"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="bg-mahogany-600 hover:bg-mahogany-700">
                  {editingId ? 'Update' : 'Add to Whitelist'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Bulk Add Phone Numbers</DialogTitle>
                <DialogDescription>
                  Add multiple phone numbers at once. One per line in format: phone,name,notes
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bulk">Phone Numbers</Label>
                  <Textarea
                    id="bulk"
                    placeholder="+254712345678,John Doe,Family&#10;+254723456789,Jane Smith,Friend&#10;+254734567890,Bob Jones"
                    value={bulkData}
                    onChange={(e) => setBulkData(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: +2547XXXXXXXX,Name,Notes (name and notes are optional)
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkAdd} className="bg-mahogany-600 hover:bg-mahogany-700">
                  Add All to Whitelist
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {selectedIds.size > 0 && (
            <Button 
              variant="destructive" 
              onClick={handleBulkDelete}
              className="ml-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete {selectedIds.size} Selected
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Whitelisted Numbers ({entries.length})</CardTitle>
            <CardDescription>Only these numbers can RSVP</CardDescription>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <div className="text-center py-12">
                <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No phone numbers whitelisted yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add your guest phone numbers to control who can RSVP
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-bronze-100">
                      <th className="text-left p-3 text-sm font-semibold w-12">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.size === entries.length && entries.length > 0}
                          onChange={toggleSelectAll}
                          className="cursor-pointer w-4 h-4 rounded border-gray-300"
                          aria-label="Select all"
                        />
                      </th>
                      <th className="text-left p-3 text-sm font-semibold">Phone</th>
                      <th className="text-left p-3 text-sm font-semibold">Name</th>
                      <th className="text-left p-3 text-sm font-semibold">Notes</th>
                      <th className="text-left p-3 text-sm font-semibold">Added</th>
                      <th className="text-left p-3 text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr 
                        key={entry.id} 
                        className={`border-b border-bronze-50 hover:bg-bronze-50/50 ${selectedIds.has(entry.id) ? 'bg-blue-50' : ''}`}
                      >
                        <td className="p-3">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.has(entry.id)}
                            onChange={() => toggleSelection(entry.id)}
                            className="cursor-pointer w-4 h-4 rounded border-gray-300"
                            aria-label={`Select ${entry.phone}`}
                          />
                        </td>
                        <td className="p-3 text-sm font-mono">{entry.phone}</td>
                        <td className="p-3 text-sm">{entry.name || '-'}</td>
                        <td className="p-3 text-sm text-muted-foreground">{entry.notes || '-'}</td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3 flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(entry)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(entry.id, entry.phone)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}