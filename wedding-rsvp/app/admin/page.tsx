'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Users, CheckCircle, XCircle, Clock, DollarSign, Download, Loader2 } from 'lucide-react';
import EditRSVPModal from '@/components/EditRSVPModal';

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
    name: string;
    email: string;
    phone: string | null;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rsvps, setRsvps] = useState<RSVPData[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    attending: 0,
    declined: 0,
    waitlisted: 0,
    totalPledges: 0
  });
  const [filter, setFilter] = useState<'all' | 'attending' | 'declined' | 'waitlisted'>('all');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/rsvps?email=${email}`);
      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setRsvps(data.rsvps);
        setStats(data.stats);
        localStorage.setItem('adminEmail', email);
        toast({
          title: "Welcome!",
          description: "Admin dashboard loaded successfully.",
        });
      } else {
        toast({
          title: "Access Denied",
          description: "You are not authorized to access this page.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load admin dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    const adminEmail = localStorage.getItem('adminEmail');
    if (!adminEmail) return;

    try {
      const response = await fetch(`/api/admin/rsvps?email=${adminEmail}&format=csv`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wedding-rsvps-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "RSVPs exported to CSV file.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export RSVPs.",
        variant: "destructive",
      });
    }
  };

  const refreshRSVPs = async () => {
    const adminEmail = localStorage.getItem('adminEmail');
    if (!adminEmail) return;

    try {
      const response = await fetch(`/api/admin/rsvps?email=${adminEmail}`);
      const data = await response.json();

      if (response.ok) {
        setRsvps(data.rsvps);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to refresh RSVPs:', error);
    }
  };

  useEffect(() => {
    const adminEmail = localStorage.getItem('adminEmail');
    if (adminEmail) {
      setEmail(adminEmail);
      handleLogin({ preventDefault: () => {} } as any);
    }
  }, []);

  const filteredRSVPs = rsvps.filter(rsvp => {
    if (filter === 'all') return true;
    if (filter === 'attending') return rsvp.attending && !rsvp.is_waitlisted;
    if (filter === 'declined') return !rsvp.attending;
    if (filter === 'waitlisted') return rsvp.is_waitlisted;
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-mahogany-800">Admin Login</CardTitle>
              <CardDescription>Enter your admin email to access the dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Access Dashboard
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-mahogany-800 mb-2">Admin Dashboard</h1>
          <p className="text-bronze-600">Manage RSVPs and guest list</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-mahogany-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-mahogany-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-mahogany-600">{stats.total}</p>
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

        {/* Total Pledges */}
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

        {/* Actions and Filters */}
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

        {/* RSVPs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-mahogany-800">Guest List ({filteredRSVPs.length})</CardTitle>
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
                    <th className="text-left p-3 text-sm font-semibold text-mahogany-800">Pledge</th>
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
                      <td className="p-3 text-sm font-medium text-mahogany-700">
                        {rsvp.pledge_amount ? `KES ${rsvp.pledge_amount.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-3">
                        <EditRSVPModal
                          rsvp={rsvp}
                          guest={rsvp.guest}
                          onSuccess={refreshRSVPs}
                          adminEmail={email}
                        />
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