'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Heart, Loader2, CheckCircle } from 'lucide-react';

export default function RSVPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hotels, setHotels] = useState<any[]>([]);
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [declined, setDeclined] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    attending: 'yes',
    note: '',
    dietary_needs: '',
    pledge_amount: '',
    hotel_choice: '',
  });

  useEffect(() => {
    // Check if user came from phone verification
    const phoneFromStorage = localStorage.getItem('verifiedPhone');
    const nameFromStorage = localStorage.getItem('guestName');
    const preAttending = localStorage.getItem('preAttending');
    const isDeclined = searchParams.get('declined') === 'true';

    if (!phoneFromStorage) {
      // No verified phone, redirect to phone verification
      router.push('/verify-phone');
      return;
    }

    setVerifiedPhone(phoneFromStorage);
    setDeclined(isDeclined);

    // Pre-fill form data
    setFormData(prev => ({
      ...prev,
      phone: phoneFromStorage,
      name: nameFromStorage || '',
      attending: isDeclined ? 'no' : (preAttending === 'true' ? 'yes' : 'no'),
    }));

    // Fetch hotels
    fetch('/api/hotels')
      .then(res => res.json())
      .then(data => {
        setHotels(data.hotels || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load hotels:', error);
        setLoading(false);
      });
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: verifiedPhone, // Override with verified phone (locked)
          attending: formData.attending === 'yes',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "RSVP Saved!",
          description: data.rsvp?.is_waitlisted 
            ? "You've been added to the waitlist. We'll notify you if a spot opens up!"
            : formData.attending === 'yes' 
              ? "Thank you for confirming! We can't wait to celebrate with you!"
              : "Thank you for letting us know. We'll miss you!",
        });
        
        // Keep verification data so they can log back in
        // Only clear the preAttending flag
        localStorage.removeItem('preAttending');
        
        // Redirect to success page
        router.push('/success');
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to save RSVP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
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

  // Show "declined" confirmation if they said no
  if (declined) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-[80vh] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blush-100 flex items-center justify-center">
              <Heart className="h-8 w-8 text-blush-600" />
            </div>
            <CardTitle>We'll Miss You!</CardTitle>
            <CardDescription>
              Thank you for letting us know
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="note">Message for the Couple (Optional)</Label>
                <Textarea
                  id="note"
                  placeholder="Share your well wishes..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Submit Response'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Heart className="h-10 w-10 text-blush-500 mx-auto mb-4" fill="currentColor" />
          <h1 className="text-4xl font-serif text-sage-800 mb-2">Complete Your RSVP</h1>
          <p className="text-muted-foreground">
            We can't wait to celebrate with you! Please fill out the details below.
          </p>
        </div>

        {/* Important Notices */}
        <div className="mb-6 space-y-3">
          <Card className="border-sage-200 bg-sage-50/30">
            <CardContent className="p-4">
              <p className="text-sm text-sage-800">
                <strong>📝 Attending as a couple?</strong> Each person should complete their own verification and RSVP separately.
              </p>
            </CardContent>
          </Card>
          <Card className="border-blush-200 bg-blush-50/30">
            <CardContent className="p-4">
              <p className="text-sm text-blush-800">
                <strong>📅 Cancellation Deadline:</strong> If you need to cancel, please do so by <strong>December 20th, 2025</strong>.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Details</CardTitle>
            <CardDescription>
              Phone: {verifiedPhone} (verified ✓)
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
                />
              </div>

              {/* Email (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                />
                <p className="text-xs text-muted-foreground">
                  Optional - for sending updates about the wedding
                </p>
              </div>

              {/* Phone (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Verified and locked
                </p>
              </div>

              {/* Hotel Choice */}
              <div className="space-y-2">
                <Label htmlFor="hotel">Accommodation Preference *</Label>
                <Select 
                  value={formData.hotel_choice} 
                  onValueChange={(value) => setFormData({ ...formData, hotel_choice: value })}
                  required
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
                
                {/* Show hotel details */}
                {formData.hotel_choice && hotels.length > 0 && (
                  <div className="mt-2 p-3 bg-bronze-50 rounded-md border border-bronze-200">
                    {hotels.map((hotel: any) => {
                      if (hotel.name.toLowerCase().replace(/ /g, '_') === formData.hotel_choice) {
                        return (
                          <div key={hotel.id} className="space-y-2 text-sm">
                            <p className="font-medium text-mahogany-800">{hotel.name}</p>
                            {hotel.description && (
                              <p className="text-bronze-700">{hotel.description}</p>
                            )}
                            {hotel.proximity && (
                              <p className="text-bronze-600">📍 {hotel.proximity}</p>
                            )}
                            {hotel.website_url && (
                              <a 
                                href={hotel.website_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-mahogany-600 hover:text-mahogany-700 underline inline-flex items-center gap-1"
                              >
                                Visit Website →
                              </a>
                            )}
                            {hotel.contact_phone && (
                              <p className="text-bronze-600">📞 {hotel.contact_phone}</p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
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
                />
                <p className="text-xs text-muted-foreground">
                  Your presence is the greatest gift! This is optional and just for planning purposes.
                </p>
              </div>

              {/* Note */}
              <div className="space-y-2">
                <Label htmlFor="note">Message for the Couple (Optional)</Label>
                <Textarea
                  id="note"
                  placeholder="Share your well wishes..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Submit RSVP'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 wedding-card p-4">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Note:</strong> We have space for 70 guests. If we reach capacity, additional RSVPs will be waitlisted.
          </p>
        </div>
      </div>
    </div>
  );
}