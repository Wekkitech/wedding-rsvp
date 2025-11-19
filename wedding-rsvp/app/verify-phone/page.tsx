'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Phone, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function PhoneVerifyPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');

  const handlePhoneVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate phone format
    const phoneRegex = /^\+2547[0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      setError("❌ Invalid phone format. Please use: +2547XXXXXXXX");
      toast({
        title: "Invalid Phone Number",
        description: "Please use format: +2547XXXXXXXX",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // Step 1: Check if phone is whitelisted
      const whitelistResponse = await fetch(`/api/check-phone-whitelist?phone=${encodeURIComponent(phone)}`);
      const whitelistData = await whitelistResponse.json();

      if (!whitelistData.allowed) {
        setError("📵 Phone number not found in guest list. Please contact the couple if you believe this is an error.");
        toast({
          title: "Phone Not Found",
          description: "This phone number is not on our guest list.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Step 2: Check if they have an existing RSVP with email
      const rsvpResponse = await fetch(`/api/rsvp?phone=${encodeURIComponent(phone)}`);
      const rsvpData = await rsvpResponse.json();

      if (rsvpData.rsvp && rsvpData.rsvp.guest?.email) {
        // They have an email - send magic link
        const email = rsvpData.rsvp.guest.email;
        const name = rsvpData.rsvp.guest.name || whitelistData.guest?.name || 'Guest';

        setGuestEmail(email);
        setGuestName(name);

        // Send magic link to their email
        const linkResponse = await fetch('/api/auth/send-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name }),
        });

        const linkData = await linkResponse.json();

        if (linkResponse.ok) {
          setEmailSent(true);
          toast({
            title: "Email Sent!",
            description: `Check ${email} for your login link.`,
          });
        } else {
          throw new Error(linkData.error || 'Failed to send magic link');
        }
      } else {
        // New guest - redirect to RSVP form
        // Store phone temporarily for RSVP form
        localStorage.setItem('verifiedPhone', phone);
        localStorage.setItem('guestName', whitelistData.guest?.name || '');
        
        toast({
          title: "Phone Verified!",
          description: "Please complete your RSVP.",
        });
        
        window.location.href = '/rsvp';
      }
    } catch (error: any) {
      setError("❌ " + (error.message || "Something went wrong. Please try again."));
      toast({
        title: "Error",
        description: error.message || "Failed to process request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Success state - email sent
  if (emailSent) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-[80vh] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Check Your Email!</CardTitle>
            <CardDescription>
              Hi {guestName}! We've sent a login link to <strong>{guestEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-sm text-blue-800 mb-2">
                <strong>📧 What's next:</strong>
              </p>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Check your email inbox</li>
                <li>Click the login link</li>
                <li>Access your RSVP</li>
              </ol>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              The link will expire in 24 hours. Didn't receive it? Check your spam folder.
            </p>

            <Button
              variant="outline"
              onClick={() => {
                setEmailSent(false);
                setPhone('');
                setError('');
              }}
              className="w-full"
            >
              Try Different Phone Number
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Initial form
  return (
    <div className="container mx-auto px-4 py-12 min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-sage-100 flex items-center justify-center">
            <Phone className="h-8 w-8 text-sage-600" />
          </div>
          <CardTitle>Verify Your Phone Number</CardTitle>
          <CardDescription>
            Enter your phone number to access your RSVP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePhoneVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+2547XXXXXXXX"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError('');
                }}
                required
                pattern="^\+2547[0-9]{8}$"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Format: +2547XXXXXXXX (Kenyan mobile number)
              </p>
              
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </span>
              ) : (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  Verify Phone Number
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-sage-50 rounded-md border border-sage-200">
            <p className="text-xs text-sage-700 mb-2">
              <strong>🔐 How it works:</strong>
            </p>
            <ol className="text-xs text-sage-600 space-y-1 list-decimal list-inside">
              <li>Enter your registered phone number</li>
              <li>We'll send a secure link to your email</li>
              <li>Click the link to access your RSVP</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}