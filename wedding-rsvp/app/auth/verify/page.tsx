'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your login link...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No token provided');
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
          // Store guest info in localStorage
          localStorage.setItem('guest', JSON.stringify(data.guest));
          
          // IMPORTANT: Also store phone separately for backward compatibility
          if (data.guest.phone) {
            localStorage.setItem('verifiedPhone', data.guest.phone);
          }
          
          // Store name if available
          if (data.guest.name) {
            localStorage.setItem('guestName', data.guest.name);
          }
          
          setStatus('success');
          setMessage('Login successful! Redirecting...');
          
          // Redirect to profile page (not rsvp - they already have an RSVP)
          setTimeout(() => {
            router.push('/profile');
          }, 1500);
        } else {
          setStatus('error');
          setMessage(data.error || 'Invalid or expired link');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Failed to verify login link');
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
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Error'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">{message}</p>
          
          {status === 'error' && (
            <Link href="/verify-phone">
              <Button className="w-full">Try Again</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}