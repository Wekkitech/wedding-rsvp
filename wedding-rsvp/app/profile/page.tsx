// app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Loader2, Lock, AlertCircle, CheckCircle, Edit } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const DEADLINE_DATE = new Date('2025-12-20T23:59:59Z');

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rsvp, setRsvp] = useState<any>(null);
  const [hotels, setHotels] = useState<any[]>([]);
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [isAfterDeadline, setIsAfterDeadline] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    attending: 'yes',
    note: '',
    dietary_needs: '',
    pledge_amount: '',
    hotel_choice: '',
  });

  useEffect(() => {
    // Check if past deadline
    const now = new Date();
    setIsAfterDeadline(now > DEADLINE_DATE);

    // Check for localStorage auth (phone verification) OR magic link login
    const phone = localStorage.getItem('verifiedPhone');
    const guestData = localStorage.getItem('guest'); // From magic link login

    if (!phone && !guestData) {
      router.push('/verify-phone');
      return;
    }

    // If logged in via magic link, get phone from guest data
    let finalPhone = phone;
    if (!finalPhone && guestData) {
      try {
        const guest = JSON.parse(guestData);
        finalPhone = guest.phone;
      } catch (e) {
        router.push('/verify-phone');
        return;
      }
    }

    if (!finalPhone) {
      router.push('/verify-phone');
      return;
    }

    setVerifiedPhone(finalPhone);
    loadRSVP(finalPhone);
    loadHotels();
  }, [router]);

  const loadRSVP = async (phone: string) => {
    try {
      const response = await fetch(`/api/rsvp?phone=${encodeURIComponent(phone)}`);
      const data = await response.json();

      if (data.rsvp) {
        setRsvp(data.rsvp);
        // Pre-fill form with existing data
        setFormData({
          name: data.rsvp.guest?.name || '',
          email: data.rsvp.guest?.email || '',
          attending: data.rsvp.attending ? 'yes' : 'no',
          note: data.rsvp.note || '',
          dietary_needs: data.rsvp.dietary_needs || '',
          pledge_amount: data.rsvp.pledge_amount?.toString() || '',
          hotel_choice: data.rsvp.hotel_choice || '',
        });
      } else {
        // No RSVP yet, redirect to create one
        router.push('/rsvp');
      }
    } catch (error) {
      console.error('Error loading RSVP:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your RSVP',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadHotels = async () => {
    try {
      const response = await fetch('/api/hotels');
      const data = await response.json();
      setHotels(data.hotels || []);
    } catch (error) {
      console.error('Failed to load hotels:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isAfterDeadline) {
      toast({
        title: 'Deadline Passed',
        description: 'The update deadline has passed. Please contact us directly for changes.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/rsvp/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: verifiedPhone,
          ...formData,
          attending: formData.attending === 'yes',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'RSVP Updated!',
          description: 'Your changes have been saved successfully.',
        });
        
        // Refresh RSVP data
        loadRSVP(verifiedPhone);
      } else {
        toast({
          title: 'Update Failed',
          description: data.error || 'Failed to update RSVP',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
      </div>
    );
  }

  if (!rsvp) {
    return null;
  }

  // Calculate days until deadline
  const now = new Date();
  const daysUntilDeadline = Math.ceil((DEADLINE_DATE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Edit className="h-10 w-10 text-blush-500 mx-auto mb-4" />
          <h1 className="text-4xl font-serif text-sage-800 mb-2">Manage Your RSVP</h1>
          <p className="text-muted-foreground">
            View and update your wedding response
          </p>
        </div>

        {/* Deadline Alert */}
        {!isAfterDeadline && daysUntilDeadline <= 30 && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <Calendar className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-800">Update Deadline</AlertTitle>
            <AlertDescription className="text-orange-700">
              You have <strong>{daysUntilDeadline} days</strong> until December 20th, 2025 to make changes to your RSVP.
            </AlertDescription>
          </Alert>
        )}

        {isAfterDeadline && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <Lock className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Updates Locked</AlertTitle>
            <AlertDescription className="text-red-700">
              The deadline for RSVP updates has passed. If you need to make changes, please contact us directly.
            </AlertDescription>
          </Alert>
        )}

        {/* Current Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Current RSVP Status
            </CardTitle>
            <CardDescription>
              Phone: {verifiedPhone} (verified ✓)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={`font-medium ${rsvp.attending ? 'text-green-600' : 'text-red-600'}`}>
                  {rsvp.is_waitlisted ? 'Waitlisted' : rsvp.attending ? 'Attending' : 'Not Attending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted:</span>
                <span className="font-medium">
                  {new Date(rsvp.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Update Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isAfterDeadline ? 'Your RSVP Details' : 'Update Your RSVP'}
            </CardTitle>
            <CardDescription>
              {isAfterDeadline 
                ? 'View-only mode - deadline has passed' 
                : 'Make changes to your wedding response'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isAfterDeadline}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isAfterDeadline}
                />
              </div>

              {/* Attending */}
              <div className="space-y-2">
                <Label htmlFor="attending">Will you be attending?</Label>
                <Select 
                  value={formData.attending} 
                  onValueChange={(value) => setFormData({ ...formData, attending: value })}
                  disabled={isAfterDeadline}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes, I'll be there!</SelectItem>
                    <SelectItem value="no">Sorry, can't make it</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.attending === 'yes' && (
                <>
                  {/* Hotel Choice */}
                  <div className="space-y-2">
                    <Label htmlFor="hotel">Accommodation Preference</Label>
                    <Select 
                      value={formData.hotel_choice} 
                      onValueChange={(value) => setFormData({ ...formData, hotel_choice: value })}
                      disabled={isAfterDeadline}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select accommodation" />
                      </SelectTrigger>
                      <SelectContent>
                        {hotels.map((hotel: any) => (
                          <SelectItem key={hotel.id} value={hotel.name.toLowerCase().replace(/ /g, '_')}>
                            {hotel.name} - KES {hotel.price_min.toLocaleString()}
                            {hotel.price_max !== hotel.price_min && `-${hotel.price_max.toLocaleString()}`}/night
                          </SelectItem>
                        ))}
                        <SelectItem value="traveling_back">Traveling back same day</SelectItem>
                        <SelectItem value="sorted_externally">Sorted accommodation externally</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dietary Needs */}
                  <div className="space-y-2">
                    <Label htmlFor="dietary">Dietary Requirements</Label>
                    <Textarea
                      id="dietary"
                      placeholder="Any allergies or dietary restrictions?"
                      value={formData.dietary_needs}
                      onChange={(e) => setFormData({ ...formData, dietary_needs: e.target.value })}
                      rows={2}
                      disabled={isAfterDeadline}
                    />
                  </div>

                  {/* Pledge Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="pledge">Gift Pledge (KES)</Label>
                    <Input
                      id="pledge"
                      type="number"
                      placeholder="Optional amount"
                      value={formData.pledge_amount}
                      onChange={(e) => setFormData({ ...formData, pledge_amount: e.target.value })}
                      min="0"
                      disabled={isAfterDeadline}
                    />
                  </div>
                </>
              )}

              {/* Note */}
              <div className="space-y-2">
                <Label htmlFor="note">Message for the Couple</Label>
                <Textarea
                  id="note"
                  placeholder="Share your well wishes..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows={3}
                  disabled={isAfterDeadline}
                />
              </div>

              {/* Submit Button */}
              {!isAfterDeadline && (
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    'Update RSVP'
                  )}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}