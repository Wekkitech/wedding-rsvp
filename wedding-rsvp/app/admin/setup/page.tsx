'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Loader2 } from 'lucide-react';

export default function AdminSetupPage() {
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);

  // Check current email on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      setCurrentEmail(localStorage.getItem('adminEmail'));
    }
  });

  const handleSaveEmail = () => {
    if (!email) {
      alert('Please enter your email');
      return;
    }

    // Save to localStorage
    localStorage.setItem('adminEmail', email);
    
    // Verify it was saved
    const saved = localStorage.getItem('adminEmail');
    
    if (saved === email) {
      setSaved(true);
      setCurrentEmail(email);
      
      // Redirect to hotels page after 2 seconds
      setTimeout(() => {
        window.location.href = '/admin/hotels';
      }, 2000);
    } else {
      alert('Failed to save email. Please try again.');
    }
  };

  const handleClearEmail = () => {
    if (confirm('Clear saved email from this device?')) {
      localStorage.removeItem('adminEmail');
      setCurrentEmail(null);
      setSaved(false);
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mahogany-50 via-ivory-50 to-bronze-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif text-mahogany-800">
            Admin Setup
          </CardTitle>
          <CardDescription>
            Set your admin email for this device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          {currentEmail ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-5 w-5 text-green-600" />
                <p className="font-semibold text-green-900">Email is set!</p>
              </div>
              <p className="text-sm text-green-700 font-mono">{currentEmail}</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearEmail}
                className="mt-3 w-full"
              >
                Clear Email
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                No admin email set on this device. Enter your email below.
              </p>
            </div>
          )}

          {/* Email Input Form */}
          {!saved && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Your Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveEmail();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  This is the email you use to login as admin
                </p>
              </div>

              <Button 
                onClick={handleSaveEmail}
                className="w-full bg-mahogany-600 hover:bg-mahogany-700"
                disabled={!email}
              >
                Save Email to This Device
              </Button>
            </div>
          )}

          {/* Success Message */}
          {saved && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <p className="font-semibold text-green-900">Saved Successfully!</p>
                </div>
                <p className="text-sm text-green-700 mb-3">
                  Email: <span className="font-mono">{email}</span>
                </p>
                <p className="text-sm text-green-700">
                  Redirecting to Hotels page...
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => window.location.href = '/admin/hotels'}
                  className="flex-1 bg-mahogany-600 hover:bg-mahogany-700"
                >
                  Go to Hotels
                </Button>
                <Button 
                  onClick={() => window.location.href = '/admin/phone-whitelist'}
                  variant="outline"
                  className="flex-1"
                >
                  Go to Whitelist
                </Button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> You need to do this on each device (laptop, phone, tablet) 
              because localStorage is separate per device.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = '/admin'}
              className="flex-1"
            >
              ← Back to Admin
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = '/'}
              className="flex-1"
            >
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}