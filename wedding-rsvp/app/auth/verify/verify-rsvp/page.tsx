'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function VerifyRSVPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your link...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    async function verify() {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok && data.success && data.guest) {
          // Store verified phone and guest data
          if (data.guest.phone) {
            localStorage.setItem('verifiedPhone', data.guest.phone);
          }
          if (data.guest.name) {
            localStorage.setItem('guestName', data.guest.name);
          }
          if (data.guest.email) {
            localStorage.setItem('guestEmail', data.guest.email);
          }
          
          setStatus('success');
          setMessage('Verification successful! Redirecting...');
          
          // Redirect to RSVP confirmation page
          setTimeout(() => {
            router.push('/rsvp-confirmation');
          }, 1500);
        } else {
          setStatus('error');
          setMessage(data.error || 'Invalid or expired verification link');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Failed to verify link');
      }
    }

    verify();
  }, [searchParams, router]);

  return (
    <div className="container mx-auto px-4 py-12 min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-sage-100 flex items-center justify-center">
            {status === 'loading' && <Loader2 className="h-8 w-8 text-sage-600 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-8 w-8 text-green-600" />}
            {status === 'error' && <XCircle className="h-8 w-8 text-red-600" />}
          </div>
          <CardTitle>
            {status === 'loading' && 'Verifying...'}
            {status === 'success' && 'Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>
          
          {status === 'error' && (
            <div className="space-y-3 pt-4">
              <Link href="/verify-phone">
                <Button className="w-full">
                  Try Again
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground">
                Verification links expire after 24 hours. Request a new one by entering your phone number.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyRSVPPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
      </div>
    }>
      <VerifyRSVPContent />
    </Suspense>
  );
}