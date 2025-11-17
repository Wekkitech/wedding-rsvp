'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Phone, Loader2, Heart, CheckCircle, XCircle, Mail, AlertCircle } from 'lucide-react';

export default function PhoneVerifyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<'verify' | 'attendance' | 'email-verify'>('verify');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [verifiedGuest, setVerifiedGuest] = useState<any>(null);
  const [linkSent, setLinkSent] = useState(false);

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
      // Check if phone is whitelisted
      console.log('Checking phone:', phone);
      const response = await fetch(`/api/check-phone-whitelist?phone=${encodeURIComponent(phone)}`);
      const data = await response.json();
      console.log('Verification response:', data);

      if (data.allowed) {
        // Phone is whitelisted! Now check if they already have an RSVP
        const rsvpResponse = await fetch(`/api/rsvp?phone=${encodeURIComponent(phone)}`);
        const rsvpData = await rsvpResponse.json();
        
        if (rsvpData.rsvp && rsvpData.rsvp.guest?.email) {
          // They already have an RSVP with email - skip email verification
          localStorage.setItem('verifiedPhone', phone);
          localStorage.setItem('guestName', rsvpData.rsvp.guest?.name || data.guest?.name || '');
          
          toast({
            title: "Welcome back!",
            description: `Hi ${rsvpData.rsvp.guest?.name}! Redirecting...`,
          });
          
          setTimeout(() => {
            router.push('/profile');
          }, 1000);
        } else if (rsvpData.rsvp) {
          // Has existing RSVP - redirect to profile to view/update
          localStorage.setItem('verifiedPhone', phone);
          localStorage.setItem('guestName', rsvpData.rsvp.guest?.name || data.guest?.name || '');
          router.push('/profile');
        } else {
          // New RSVP - show attendance question
          setVerifiedGuest({
            phone: phone,
            name: data.guest?.name || 'Guest'
          });
          setGuestName(data.guest?.name || '');
          setStep('attendance');
          
          toast({
            title: "Verified!",
            description: `Welcome ${data.guest?.name || 'Guest'}!`,
          });
        }
      } else {
        setError("📵 Phone number not found in guest list. Please contact the couple if you believe this is an error.");
        toast({
          title: "Phone Not Found",
          description: "This phone number is not on our guest list.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setError("❌ Connection error. Please check your internet and try again.");
      toast({
        title: "Error",
        description: "Failed to verify phone number. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-verification-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          email: guestEmail,
          name: guestName
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLinkSent(true);
        toast({
          title: "Email Sent!",
          description: `Check ${guestEmail} for your verification link.`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send verification email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceResponse = async (attending: boolean) => {
    setLoading(true);

    try {
      // Store verified phone in session/localStorage
      localStorage.setItem('verifiedPhone', phone);
      localStorage.setItem('guestName', guestName);
      localStorage.setItem('preAttending', attending.toString());

      if (attending) {
        // Redirect to full RSVP form
        router.push('/rsvp');
      } else {
        // Redirect to decline page
        router.push('/rsvp?declined=true');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        {step === 'verify' ? (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-sage-100 flex items-center justify-center">
                <Phone className="h-8 w-8 text-sage-600" />
              </div>
              <CardTitle>Verify Your Phone Number</CardTitle>
              <CardDescription>
                To confirm your identity and RSVP, please enter your phone number
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
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
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
                <p className="text-xs text-sage-700">
                  <strong>Privacy Note:</strong> Your phone number is used only to verify your invitation and will not be shared with third parties.
                </p>
              </div>
            </CardContent>
          </>
        ) : step === 'email-verify' ? (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Email Verification Required</CardTitle>
              <CardDescription>
                For your security, we need to verify your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!linkSent ? (
                <>
                  <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                    <p className="text-sm text-blue-800 mb-3">
                      <strong>Hi {guestName}!</strong>
                    </p>
                    <p className="text-sm text-blue-700">
                      We found an existing RSVP for this phone number. To protect your privacy, 
                      we'll send a secure verification link to:
                    </p>
                    <p className="text-sm font-mono font-semibold text-blue-900 mt-2">
                      {guestEmail}
                    </p>
                  </div>

                  <Button 
                    onClick={handleSendVerificationEmail}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Verification Link
                      </>
                    )}
                  </Button>

                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground text-center">
                      Not your email? Please contact the couple to update your RSVP.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center space-y-4">
                    <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sage-800 mb-2">Check your email!</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        We've sent a verification link to <strong>{guestEmail}</strong>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Click the link in your email to view and manage your RSVP. The link will expire in 24 hours.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setLinkSent(false);
                        setStep('verify');
                        setPhone('');
                      }}
                      className="w-full"
                    >
                      Try Different Phone Number
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleSendVerificationEmail}
                      disabled={loading}
                      className="w-full text-sm"
                    >
                      Resend Email
                    </Button>
                  </div>
                </>
              )}

              <div className="mt-6 p-4 bg-amber-50 rounded-md border border-amber-200">
                <p className="text-xs text-amber-800">
                  <strong>🔒 Why email verification?</strong> To protect your personal information 
                  (dietary needs, hotel choice, etc.) from unauthorized access.
                </p>
              </div>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blush-100 flex items-center justify-center">
                <Heart className="h-8 w-8 text-blush-600" fill="currentColor" />
              </div>
              <CardTitle>Hello {guestName}! 💕</CardTitle>
              <CardDescription>
                Would you like to attend our wedding?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button 
                  onClick={() => handleAttendanceResponse(true)}
                  disabled={loading}
                  className="w-full h-auto py-4 bg-green-600 hover:bg-green-700"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-semibold">Absolutely! 🎉</div>
                      <div className="text-xs font-normal opacity-90">
                        I'll be there to celebrate with you
                      </div>
                    </div>
                  </div>
                </Button>

                <Button 
                  onClick={() => handleAttendanceResponse(false)}
                  disabled={loading}
                  variant="outline"
                  className="w-full h-auto py-4 border-2"
                >
                  <div className="flex items-center gap-3">
                    <XCircle className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-semibold">Sorry, I can't make it</div>
                      <div className="text-xs font-normal text-muted-foreground">
                        I have other commitments
                      </div>
                    </div>
                  </div>
                </Button>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-sage-600" />
                </div>
              )}

              <div className="mt-6 p-4 bg-blush-50 rounded-md border border-blush-200">
                <p className="text-xs text-blush-800">
                  <strong>Note:</strong> If you select "Absolutely!", you'll be directed to fill in more details about dietary requirements and accommodation.
                </p>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}