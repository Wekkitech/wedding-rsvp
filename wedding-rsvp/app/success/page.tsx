'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, MapPin, Calendar, Download, Home, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { generateICalendar } from '@/lib/email-templates';
import AddToCalendarButton from '@/components/AddToCalendarButton';

export default function SuccessPage() {
  const router = useRouter();
  const [rsvp, setRsvp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifiedPhone, setVerifiedPhone] = useState('');

  useEffect(() => {
    // Check for verified phone from new flow
    const phone = localStorage.getItem('verifiedPhone');
    
    if (!phone) {
      // No verified phone, redirect to verification
      router.push('/verify-phone');
      return;
    }

    setVerifiedPhone(phone);
    
    // Try to load RSVP data
    const rsvpData = localStorage.getItem('rsvp');
    if (rsvpData) {
      // Old flow - has rsvp in localStorage
      setRsvp(JSON.parse(rsvpData));
      setLoading(false);
    } else {
      // New flow - fetch RSVP by phone
      fetchRSVP(phone);
    }
  }, [router]);

  const fetchRSVP = async (phone: string) => {
    try {
      const response = await fetch(`/api/rsvp?phone=${encodeURIComponent(phone)}`);
      const data = await response.json();
      
      if (data.rsvp) {
        setRsvp(data.rsvp);
      }
    } catch (error) {
      console.error('Error fetching RSVP:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCalendar = () => {
    const icsContent = generateICalendar();
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'brill-damaris-wedding.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600"></div>
      </div>
    );
  }

  if (!rsvp) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-[80vh] flex items-center justify-center">
        <Card className="w-full max-w-md text-center p-6">
          <p className="text-muted-foreground mb-4">Unable to load RSVP data</p>
          <Link href="/verify-phone">
            <Button>Return to Verification</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isAttending = rsvp.attending;
  const isWaitlisted = rsvp.is_waitlisted;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl">
              {isAttending
                ? isWaitlisted
                  ? "You're on the Waitlist!"
                  : "See You There!"
                : "Thank You!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isAttending ? (
              isWaitlisted ? (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Thank you for your interest! We've added you to our waitlist. We'll notify you immediately if a spot becomes available.
                  </p>
                  <div className="wedding-card p-4 bg-amber-50 border-amber-200">
                    <p className="text-sm text-amber-800">
                      <strong>Waitlist Status:</strong> We've reached our capacity of 70 guests, but we'd love to have you if space opens up!
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                      Your RSVP has been confirmed! We're so excited to celebrate with you.
                    </p>
                  </div>

                  {/* Event Details */}
                  <div className="wedding-card p-6 space-y-4">
                    <h3 className="font-semibold text-sage-800 text-lg">Event Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-sage-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Friday, January 23, 2026</p>
                          <p className="text-sm text-muted-foreground">Ceremony: 11:00 AM - 1:00 PM</p>
                          <p className="text-sm text-muted-foreground">Reception: 1:30 PM - 4:30 PM</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-sage-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Rusinga Island Lodge</p>
                          <p className="text-sm text-muted-foreground">Rusinga Island, Kenya</p>
                          <p className="text-sm text-muted-foreground">~290 KM from Nakuru CBD</p>
                        </div>
                      </div>
                    </div>
                  </div>
{/* Quick Actions */}
<div className="grid sm:grid-cols-2 gap-3">
  <AddToCalendarButton variant="outline" className="w-full" />
                    <Link 
                      href="https://maps.google.com/?q=Rusinga+Island+Lodge" 
                      target="_blank"
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full">
                        <MapPin className="h-4 w-4 mr-2" />
                        Get Directions
                      </Button>
                    </Link>
                  </div>

                  {/* Your Details */}
                  {rsvp.guest && (
                    <div className="wedding-card p-4 bg-sage-50 border-sage-200">
                      <h4 className="font-semibold text-sage-800 mb-3 text-sm">Your RSVP Details:</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Name:</strong> {rsvp.guest.name}</p>
                        {rsvp.hotel_choice && (
                          <p><strong>Accommodation:</strong> {rsvp.hotel_choice.replace(/_/g, ' ')}</p>
                        )}
                        {rsvp.dietary_needs && (
                          <p><strong>Dietary:</strong> {rsvp.dietary_needs}</p>
                        )}
                        {rsvp.pledge_amount && (
                          <p><strong>Gift Pledge:</strong> KES {rsvp.pledge_amount.toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )
            ) : (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  We're sorry you can't make it, but we understand. Thank you for letting us know!
                </p>
                <p className="text-sm text-muted-foreground">
                  We hope to celebrate with you another time. 💕
                </p>
              </div>
            )}

            {/* Next Steps */}
            <div className="space-y-3 pt-6 border-t">
              <h4 className="font-semibold text-sage-800">What's Next?</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                {isAttending && !isWaitlisted && (
                  <>
                    <p>✓ Check out <Link href="/travel" className="text-sage-600 hover:underline">travel and accommodation</Link> options</p>
                    <p>✓ Add the event to your calendar using the button above</p>
                    <p>✓ You can update your RSVP anytime by verifying your phone again</p>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              {verifiedPhone && (
                <Link href="/rsvp-confirmation" className="flex-1">
                  <Button className="w-full">
                    View Full RSVP
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>

            {/* Manage RSVP Later */}
            <div className="pt-6 border-t border-sage-100 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Need to update your RSVP later?
              </p>
              <Link href="/verify-phone">
                <Button variant="ghost" size="sm" className="text-sage-600 hover:text-sage-800">
                  Verify Phone to Manage RSVP
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}