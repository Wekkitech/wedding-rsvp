'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Loader2, MapPin, Calendar, Edit, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [guest, setGuest] = useState<any>(null);
  const [rsvp, setRSVP] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const guestData = localStorage.getItem('guest');
    if (!guestData) {
      router.push('/login');
      return;
    }

    const parsedGuest = JSON.parse(guestData);
    setGuest(parsedGuest);

    // Fetch RSVP details
    fetch(`/api/rsvp?email=${parsedGuest.email}`)
      .then(res => res.json())
      .then(data => {
        if (data.rsvp) {
          setRSVP(data.rsvp);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching RSVP:', error);
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('guest');
    localStorage.removeItem('rsvp');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-mahogany-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Heart className="h-12 w-12 text-orange-500 mx-auto mb-4" fill="currentColor" />
          <h1 className="text-4xl font-serif text-mahogany-800 mb-2">Your Profile</h1>
          <p className="text-bronze-600">
            Welcome back, {guest?.name || guest?.email}!
          </p>
        </div>

        {/* Profile Information */}
        <Card className="mb-6 border-2 border-bronze-200">
          <CardHeader>
            <CardTitle className="text-mahogany-800">Your Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-bronze-100">
              <span className="text-sm font-medium text-bronze-700">Email:</span>
              <span className="text-sm text-mahogany-800">{guest?.email}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-bronze-100">
              <span className="text-sm font-medium text-bronze-700">Name:</span>
              <span className="text-sm text-mahogany-800">{guest?.name || 'Not provided'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-bronze-700">Phone:</span>
              <span className="text-sm text-mahogany-800">{guest?.phone || 'Not provided'}</span>
            </div>
          </CardContent>
        </Card>

        {/* RSVP Status */}
        {rsvp ? (
          <Card className={`mb-6 border-2 ${rsvp.attending ? 'border-mahogany-300 bg-mahogany-50/30' : 'border-bronze-300'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-mahogany-800 flex items-center gap-2">
                    {rsvp.attending ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        You're Attending!
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-orange-600" />
                        Unable to Attend
                      </>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {rsvp.is_waitlisted && "You're currently on the waitlist"}
                  </CardDescription>
                </div>
                <Link href="/rsvp">
                  <Button variant="outline" size="sm" className="border-bronze-300">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit RSVP
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {rsvp.attending && (
                <>
                  {rsvp.hotel_choice && (
                    <div className="bg-white/60 p-4 rounded-lg border border-bronze-200">
                      <p className="text-sm font-medium text-bronze-700 mb-1">Accommodation:</p>
                      <p className="text-sm text-mahogany-800 capitalize">
                        {rsvp.hotel_choice.replace(/_/g, ' ')}
                      </p>
                    </div>
                  )}

                  {rsvp.dietary_needs && (
                    <div className="bg-white/60 p-4 rounded-lg border border-bronze-200">
                      <p className="text-sm font-medium text-bronze-700 mb-1">Dietary Requirements:</p>
                      <p className="text-sm text-mahogany-800">{rsvp.dietary_needs}</p>
                    </div>
                  )}

                  {rsvp.pledge_amount && (
                    <div className="bg-white/60 p-4 rounded-lg border border-bronze-200">
                      <p className="text-sm font-medium text-bronze-700 mb-1">Gift Pledge:</p>
                      <p className="text-sm text-mahogany-800">KES {rsvp.pledge_amount.toLocaleString()}</p>
                    </div>
                  )}
                </>
              )}

              {rsvp.note && (
                <div className="bg-white/60 p-4 rounded-lg border border-bronze-200">
                  <p className="text-sm font-medium text-bronze-700 mb-1">Your Message:</p>
                  <p className="text-sm text-mahogany-800 italic">"{rsvp.note}"</p>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-bronze-600 pt-2">
                <Clock className="h-3 w-3" />
                <span>Last updated: {new Date(rsvp.updated_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 border-2 border-orange-300 bg-orange-50/30">
            <CardHeader>
              <CardTitle className="text-orange-800">No RSVP Yet</CardTitle>
              <CardDescription>You haven't submitted your RSVP</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-bronze-700 mb-4">
                Please let us know if you can attend our special day!
              </p>
              <Link href="/rsvp">
                <Button className="bg-mahogany-600 hover:bg-mahogany-700">
                  Submit Your RSVP
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Event Details Reminder */}
        <Card className="mb-6 border-2 border-bronze-200">
          <CardHeader>
            <CardTitle className="text-mahogany-800">Event Details</CardTitle>
            <CardDescription>Save the date!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-mahogany-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-mahogany-800">Friday, January 23, 2026</p>
                <p className="text-xs text-bronze-600">Ceremony: 11:00 AM - 1:00 PM</p>
                <p className="text-xs text-bronze-600">Reception: 1:30 PM - 4:30 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-mahogany-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-mahogany-800">Rusinga Island Lodge</p>
                <p className="text-xs text-bronze-600">Rusinga Island, Kenya (~290KM from Nakuru)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Link href="/travel">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-bronze-200 h-full">
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="font-medium text-mahogany-800">Travel & Accommodation</p>
                <p className="text-xs text-bronze-600 mt-1">View options</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/faq">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-bronze-200 h-full">
              <CardContent className="p-6 text-center">
                <Heart className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="font-medium text-mahogany-800">FAQs & Contact</p>
                <p className="text-xs text-bronze-600 mt-1">Get answers</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Logout */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="border-bronze-300 text-bronze-700 hover:bg-bronze-50"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}