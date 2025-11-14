'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function WhitelistDebugPage() {
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<any>(null);
  const [allNumbers, setAllNumbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const checkPhone = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/check-phone-whitelist?phone=${encodeURIComponent(phone)}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to check' });
    } finally {
      setLoading(false);
    }
  };

  const loadAllNumbers = async () => {
    setLoading(true);
    try {
      // Direct Supabase query to see all whitelisted numbers
      const response = await fetch('/api/debug-whitelist');
      const data = await response.json();
      setAllNumbers(data.numbers || []);
    } catch (error) {
      console.error('Failed to load numbers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Phone Whitelist Debug Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Test Phone Number</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="+2547XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Button onClick={checkPhone} disabled={loading}>
                  Check
                </Button>
              </div>
            </div>

            {result && (
              <div className="p-4 bg-gray-100 rounded-md">
                <p className="font-bold mb-2">Result:</p>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Whitelisted Numbers</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={loadAllNumbers} disabled={loading} className="mb-4">
              Load All Numbers
            </Button>
            
            {allNumbers.length > 0 && (
              <div className="space-y-2">
                <p className="font-bold">Total: {allNumbers.length}</p>
                <div className="max-h-96 overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Phone</th>
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allNumbers.map((num: any, i: number) => (
                        <tr key={i} className="border-b">
                          <td className="p-2 font-mono">{num.phone}</td>
                          <td className="p-2">{num.name || '-'}</td>
                          <td className="p-2 text-gray-600">{num.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}