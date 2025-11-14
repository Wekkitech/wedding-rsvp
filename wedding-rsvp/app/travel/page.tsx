'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Car, Plane, Hotel, Phone, Mail, Loader2, Globe } from "lucide-react";
import Link from "next/link";

interface HotelData {
  id: string;
  name: string;
  price_min: number;
  price_max: number;
  proximity: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  website_url: string | null;
  description: string | null;
  is_active: boolean;
  display_order: number;
}

export default function TravelPage() {
  const [hotels, setHotels] = useState<HotelData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      const response = await fetch('/api/hotels');
      const data = await response.json();
      
      if (response.ok) {
        // Only show active hotels
        const activeHotels = (data.hotels || [])
          .filter((h: HotelData) => h.is_active)
          .sort((a: HotelData, b: HotelData) => a.display_order - b.display_order);
        setHotels(activeHotels);
      }
    } catch (error) {
      console.error('Failed to load hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-sage-800 mb-4">
            Travel & Accommodation
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about getting to Rusinga Island and where to stay
          </p>
        </div>

        {/* Getting There */}
        <section className="mb-12">
          <h2 className="section-title mb-6">Getting to Rusinga Island</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-full bg-sage-100 flex items-center justify-center">
                    <Car className="h-5 w-5 text-sage-600" />
                  </div>
                  <CardTitle>By Road</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-sm text-sage-800">From Nakuru</p>
                  <p className="text-sm text-muted-foreground">
                    ~290 KM, approximately 5-6 hours drive
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-sage-800">Route</p>
                  <p className="text-sm text-muted-foreground">
                    Nakuru → Kericho → Kisumu → Mbita → Rusinga Island (via causeway)
                  </p>
                </div>
                <Link href="https://maps.google.com/?q=Rusinga+Island+Lodge" target="_blank">
                  <Button variant="outline" size="sm" className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    View Route on Google Maps
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-full bg-blush-100 flex items-center justify-center">
                    <Plane className="h-5 w-5 text-blush-600" />
                  </div>
                  <CardTitle>By Air</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-sm text-sage-800">Nearest Airport</p>
                  <p className="text-sm text-muted-foreground">
                    Kisumu International Airport (KIS)
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-sage-800">From Airport</p>
                  <p className="text-sm text-muted-foreground">
                    ~90 KM to Rusinga Island, 2 hours by road. We can help arrange transport!
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Contact us if you need help with airport transfers
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Accommodation Options - DYNAMIC FROM DATABASE */}
        <section className="mb-12">
          <h2 className="section-title mb-6">Where to Stay</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
            </div>
          ) : hotels.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Hotel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Accommodation options coming soon!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {hotels.map((hotel) => (
                <Card key={hotel.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                          <Hotel className="h-5 w-5 text-sage-600" />
                        </div>
                        <div>
                          <CardTitle>{hotel.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {hotel.description || "Comfortable accommodation option"}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-lg font-bold text-sage-700">
                          KES {hotel.price_min.toLocaleString()}
                          {hotel.price_max !== hotel.price_min && 
                            ` - ${hotel.price_max.toLocaleString()}`}
                          /night
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Proximity */}
                    {hotel.proximity && (
                      <div>
                        <p className="text-sm font-medium text-sage-800 mb-2">Location:</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 text-sage-600" />
                          <span>{hotel.proximity}</span>
                        </div>
                      </div>
                    )}

                    {/* Contact Information */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-sage-800">Contact:</p>
                      <div className="flex flex-col sm:flex-row gap-3 text-sm">
                        {hotel.contact_phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4 text-sage-600" />
                            <a href={`tel:${hotel.contact_phone}`} className="hover:text-sage-700">
                              {hotel.contact_phone}
                            </a>
                          </div>
                        )}
                        {hotel.contact_email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4 text-sage-600" />
                            <a href={`mailto:${hotel.contact_email}`} className="hover:text-sage-700">
                              {hotel.contact_email}
                            </a>
                          </div>
                        )}
                        {hotel.website_url && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe className="h-4 w-4 text-sage-600" />
                            <a 
                              href={hotel.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-sage-700 underline"
                            >
                              Visit Website
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Special note for venue hotel - only for Rusinga Lodge */}
                    {hotel.name.toLowerCase().includes('rusinga') && (
                      <div className="mt-3 p-3 bg-blush-50 border border-blush-200 rounded-md">
                        <p className="text-xs text-blush-800 font-medium">
                          🎉 This is our wedding venue! Limited rooms - book early!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Travel Tips */}
        <section>
          <h2 className="section-title mb-6">Travel Tips</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sage-800 mb-2">📅 When to Arrive</h3>
                  <p className="text-sm text-muted-foreground">
                    We recommend arriving on Thursday, January 22nd to settle in. The ceremony starts at 11 AM on Friday, January 23rd, 2026.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-sage-800 mb-2">🚗 Driving Conditions</h3>
                  <p className="text-sm text-muted-foreground">
                    The roads are generally good, but allow extra time for the journey. The causeway to Rusinga Island is paved.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-sage-800 mb-2">🌤️ Weather in January</h3>
                  <p className="text-sm text-muted-foreground">
                    January is warm and dry. Expect temperatures of 22-30°C (72-86°F). Perfect wedding weather!
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-sage-800 mb-2">📱 Need Help?</h3>
                  <p className="text-sm text-muted-foreground">
                    Contact us if you need assistance with travel arrangements or accommodation bookings. We're happy to help!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <div className="mt-12 text-center">
          <div className="wedding-card p-8">
            <h3 className="text-2xl font-serif text-sage-800 mb-3">
              Ready to Confirm?
            </h3>
            <p className="text-muted-foreground mb-6">
              Don't forget to submit your RSVP and let us know your accommodation choice!
            </p>
            <Link href="/rsvp">
              <Button size="lg">Submit RSVP</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}