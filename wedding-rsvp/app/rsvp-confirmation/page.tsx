'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, MapPin, Hotel, Utensils, DollarSign, MessageSquare, Loader2, Edit } from 'lucide-react';
import Link from 'next/link';

export default function RSVPConfirmationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rsvp, setRsvp] = useState<any>(null);
  const [verifiedPhone, setVerifiedPhone] = useState('');

  useEffect(() => {
    const phone = localStorage.getItem('verifiedPhone');
    
    if (!phone) {
      router.push('/verify-phone');
      return;
    }

    setVerifiedPhone(phone);
    loadRSVP(phone);
  }, [router]);

  const loadRSVP = async (phone: string) => {
    try {
      const response = await fetch(`/api/rsvp?phone=${encodeURIComponent(phone)}`);
      const data = await response.json();

      if (data.rsvp) {
        setRsvp(data.rsvp);
      } else {
        router.push('/verify-phone');
      }
    } catch (error) {
      console.error('Error loading RSVP:', error);
      router.push('/verify-phone');
    } finally {
      setLoading(false);
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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-serif text-sage-800">
              Your RSVP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Guest Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sage-800 text-lg">Guest Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{rsvp.guest?.name || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium font-mono">{rsvp.guest?.phone}</span>
                </div>
                {rsvp.guest?.email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{rsvp.guest.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sage-800 text-lg">Attendance Status</h3>
              <div className="p-4 rounded-md border-2" style={{
                backgroundColor: rsvp.is_waitlisted ? '#fef3c7' : rsvp.attending ? '#dcfce7' : '#fee2e2',
                borderColor: rsvp.is_waitlisted ? '#fbbf24' : rsvp.attending ? '#22c55e' : '#ef4444'
              }}>
                <p className="text-sm font-semibold">
                  {rsvp.is_waitlisted ? '⏳ Waitlisted' : rsvp.attending ? '✅ Attending' : '❌ Not Attending'}
                </p>
                {rsvp.is_waitlisted && (
                  <p className="text-xs mt-2">
                    We've reached our 70-guest capacity. You'll be notified if a spot opens up!
                  </p>
                )}
              </div>
            </div>

            {/* Details (if attending) */}
            {rsvp.attending && (
              <>
                {/* Hotel */}
                {rsvp.hotel_choice && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sage-800 text-lg flex items-center gap-2">
                      <Hotel className="h-5 w-5" />
                      Accommodation
                    </h3>
                    <p className="text-sm bg-sage-50 p-3 rounded-md border border-sage-200">
                      {rsvp.hotel_choice.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </p>
                  </div>
                )}

                {/* Dietary */}
                {rsvp.dietary_needs && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sage-800 text-lg flex items-center gap-2">
                      <Utensils className="h-5 w-5" />
                      Dietary Requirements
                    </h3>
                    <p className="text-sm bg-sage-50 p-3 rounded-md border border-sage-200">
                      {rsvp.dietary_needs}
                    </p>
                  </div>
                )}

                {/* Pledge */}
                {rsvp.pledge_amount && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sage-800 text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Gift Pledge
                    </h3>
                    <p className="text-sm bg-sage-50 p-3 rounded-md border border-sage-200">
                      KES {parseFloat(rsvp.pledge_amount).toLocaleString()}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Note */}
            {rsvp.note && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sage-800 text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Your Message
                </h3>
                <p className="text-sm bg-blush-50 p-3 rounded-md border border-blush-200 italic">
                  "{rsvp.note}"
                </p>
              </div>
            )}

            {/* Wedding Details Reminder */}
            {rsvp.attending && !rsvp.is_waitlisted && (
              <div className="wedding-card p-4 space-y-3">
                <h3 className="font-semibold text-sage-800">Event Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-sage-600" />
                    <span>Friday, January 23, 2026 at 11:00 AM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-sage-600" />
                    <span>Rusinga Island Lodge, Kenya</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={() => {
                  localStorage.setItem('preAttending', rsvp.attending.toString());
                  router.push('/rsvp');
                }}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Update RSVP
              </Button>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>

            {/* Submission Date */}
            <p className="text-xs text-center text-muted-foreground pt-4 border-t border-sage-100">
              Submitted on {new Date(rsvp.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}