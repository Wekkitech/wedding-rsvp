'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit } from 'lucide-react';

interface EditRSVPModalProps {
  rsvp: any;
  guest: any;
  onSuccess: () => void;
  adminEmail: string;
}

export default function EditRSVPModal({ rsvp, guest, onSuccess, adminEmail }: EditRSVPModalProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    attending: rsvp.attending,
    note: rsvp.note || '',
    dietary_needs: rsvp.dietary_needs || '',
    pledge_amount: rsvp.pledge_amount || '',
    hotel_choice: rsvp.hotel_choice || '',
    is_waitlisted: rsvp.is_waitlisted,
    pledge_fulfilled: rsvp.pledge_fulfilled || false,
  });

  const hotelOptions = [
    { value: 'rusinga_lodge', label: 'Rusinga Lodge (12K/night)' },
    { value: 'lo_rateng', label: 'Lo Rateng (8-10K/night)' },
    { value: 'white_stone', label: 'White Stone Beach Resort (5-9K/night)' },
    { value: 'chula_beach', label: 'Chula Beach (3-5K/night)' },
    { value: 'bayside_resort', label: 'Bayside Resort (8-12K/night)' },
    { value: 'traveling_back', label: 'Traveling back same day' },
    { value: 'sorted_externally', label: 'Sorted accommodation externally' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/admin/edit-rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rsvpId: rsvp.id,
          adminEmail,
          ...formData,
          pledge_amount: formData.pledge_amount ? parseFloat(formData.pledge_amount as string) : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'RSVP updated successfully',
        });
        setOpen(false);
        onSuccess();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update RSVP',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="border-bronze-300"
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-mahogany-800">Edit RSVP</DialogTitle>
            <DialogDescription>
              Editing RSVP for {guest.name || guest.email}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Guest Info (Read-only) */}
            <div className="bg-bronze-50 p-4 rounded-lg border border-bronze-200">
              <h3 className="font-medium text-mahogany-800 mb-2">Guest Information</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Email:</strong> {guest.email}</p>
                <p><strong>Name:</strong> {guest.name || 'Not provided'}</p>
                <p><strong>Phone:</strong> {guest.phone || 'Not provided'}</p>
              </div>
            </div>

            {/* Attending Status */}
            <div className="space-y-2">
              <Label htmlFor="attending">Attending Status *</Label>
              <Select
                value={formData.attending ? 'yes' : 'no'}
                onValueChange={(value) => setFormData({ ...formData, attending: value === 'yes' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">✅ Yes, Attending</SelectItem>
                  <SelectItem value="no">❌ Not Attending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Waitlist Status */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="waitlisted"
                checked={formData.is_waitlisted}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_waitlisted: checked as boolean })
                }
              />
              <Label htmlFor="waitlisted" className="cursor-pointer">
                Guest is on waitlist
              </Label>
            </div>

            {formData.attending && (
              <>
                {/* Hotel Choice */}
                <div className="space-y-2">
                  <Label htmlFor="hotel">Accommodation Choice</Label>
                  <Select
                    value={formData.hotel_choice}
                    onValueChange={(value) => setFormData({ ...formData, hotel_choice: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select accommodation" />
                    </SelectTrigger>
                    <SelectContent>
                      {hotelOptions.map((hotel) => (
                        <SelectItem key={hotel.value} value={hotel.value}>
                          {hotel.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Dietary Needs */}
                <div className="space-y-2">
                  <Label htmlFor="dietary">Dietary Requirements</Label>
                  <Textarea
                    id="dietary"
                    value={formData.dietary_needs}
                    onChange={(e) => setFormData({ ...formData, dietary_needs: e.target.value })}
                    rows={2}
                    placeholder="Any allergies or dietary restrictions"
                  />
                </div>

                {/* Pledge Amount */}
                <div className="space-y-2">
                  <Label htmlFor="pledge">Gift Pledge Amount (KES)</Label>
                  <Input
                    id="pledge"
                    type="number"
                    value={formData.pledge_amount}
                    onChange={(e) => setFormData({ ...formData, pledge_amount: e.target.value })}
                    placeholder="0"
                    min="0"
                  />
                </div>

                {/* Pledge Fulfilled */}
                {formData.pledge_amount && (
                  <div className="flex items-center space-x-2 bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <Checkbox
                      id="pledge_fulfilled"
                      checked={formData.pledge_fulfilled}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, pledge_fulfilled: checked as boolean })
                      }
                    />
                    <Label htmlFor="pledge_fulfilled" className="cursor-pointer font-medium text-mahogany-800">
                      💰 Pledge has been fulfilled/received
                    </Label>
                  </div>
                )}
              </>
            )}

            {/* Note/Message */}
            <div className="space-y-2">
              <Label htmlFor="note">Guest Message</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={3}
                placeholder="Message from the guest"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-mahogany-600 hover:bg-mahogany-700"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
