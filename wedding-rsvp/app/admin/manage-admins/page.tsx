'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Shield, UserPlus, Trash2, ArrowLeft, Loader2, Crown, Clipboard } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Admin {
  id: string;
  email: string;
  role: 'super_admin' | 'event_planner';
  created_by: string | null;
  created_at: string;
}

export default function ManageAdminsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Admin | null>(null);
  
  // Form state
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'super_admin' | 'event_planner'>('event_planner');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/verify-session');
      if (response.ok) {
        const data = await response.json();
        if (data.valid && data.role === 'super_admin') {
          setCurrentUserEmail(data.email);
          loadAdmins(data.email);
        } else {
          toast({
            title: 'Access Denied',
            description: 'Only super admins can access this page.',
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

  const loadAdmins = async (email: string) => {
    try {
      const response = await fetch(`/api/admin/manage/list?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (response.ok) {
        setAdmins(data.admins);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to load admins',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load admin list',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/manage/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestorEmail: currentUserEmail,
          email: newEmail,
          role: newRole,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success!',
          description: `Admin ${newEmail} created successfully`,
        });
        setNewEmail('');
        setNewRole('event_planner');
        setShowAddForm(false);
        loadAdmins(currentUserEmail);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to create admin',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create admin',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRole = async (targetEmail: string, newRole: 'super_admin' | 'event_planner') => {
    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/manage/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestorEmail: currentUserEmail,
          targetEmail,
          role: newRole,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success!',
          description: `Role updated successfully`,
        });
        loadAdmins(currentUserEmail);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update role',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update role',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!deleteTarget) return;

    setSubmitting(true);

    try {
      const response = await fetch(
        `/api/admin/manage/delete?requestorEmail=${encodeURIComponent(currentUserEmail)}&targetEmail=${encodeURIComponent(deleteTarget.email)}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success!',
          description: `Admin ${deleteTarget.email} deleted`,
        });
        loadAdmins(currentUserEmail);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete admin',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete admin',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
      setDeleteTarget(null);
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
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
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
              <h1 className="text-4xl font-serif text-mahogany-800 mb-2">Manage Admins</h1>
              <p className="text-bronze-600">Create and manage admin accounts</p>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          </div>
        </div>

        {/* Add Admin Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Admin</CardTitle>
              <CardDescription>Create a new admin account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newRole}
                    onValueChange={(value: 'super_admin' | 'event_planner') => setNewRole(value)}
                    disabled={submitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event_planner">
                        <div className="flex items-center gap-2">
                          <Clipboard className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Event Planner</div>
                            <div className="text-xs text-muted-foreground">View RSVPs, export CSV (no editing)</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="super_admin">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Super Admin</div>
                            <div className="text-xs text-muted-foreground">Full access to everything</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Admin
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewEmail('');
                      setNewRole('event_planner');
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Admins List */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Accounts ({admins.length})</CardTitle>
            <CardDescription>Manage existing admin users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-sage-50/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-mahogany-800">{admin.email}</p>
                      {admin.email === currentUserEmail && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        admin.role === 'super_admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {admin.role === 'super_admin' ? (
                          <>
                            <Crown className="h-3 w-3" />
                            Super Admin
                          </>
                        ) : (
                          <>
                            <Clipboard className="h-3 w-3" />
                            Event Planner
                          </>
                        )}
                      </span>
                      <span>•</span>
                      <span>Added {new Date(admin.created_at).toLocaleDateString()}</span>
                      {admin.created_by && (
                        <>
                          <span>•</span>
                          <span>by {admin.created_by}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {admin.email !== currentUserEmail && (
                      <>
                        <Select
                          value={admin.role}
                          onValueChange={(value: 'super_admin' | 'event_planner') =>
                            handleUpdateRole(admin.email, value)
                          }
                          disabled={submitting}
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="event_planner">Event Planner</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeleteTarget(admin)}
                          disabled={submitting}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {admins.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No admins found. Add one to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Admin Account?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{deleteTarget?.email}</strong>? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAdmin}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Admin'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}