'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface DeleteGuestButtonProps {
  guestId: string;
  guestName: string;
  guestEmail: string;
  adminEmail: string;
  onSuccess: () => void;
}

function DeleteGuestButton({
  guestId,
  guestName,
  guestEmail,
  adminEmail,
  onSuccess,
}: DeleteGuestButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const encodedEmail = encodeURIComponent(adminEmail);
      const url = `/api/admin/guests/${guestId}?email=${encodedEmail}`;

      const response = await fetch(url, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: '✅ Guest Deleted',
          description: data.message || 'Guest has been successfully removed.',
        });
        
        setTimeout(() => {
          setIsOpen(false);
          onSuccess();
        }, 500);
      } else {
        toast({
          title: 'Delete Failed',
          description: data.error || 'Failed to delete guest',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Guest?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                Are you sure you want to delete <strong>{guestName || guestEmail}</strong>?
              </p>
              <p className="text-red-600 font-medium">
                This action cannot be undone. This will permanently delete:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                <li>Guest profile</li>
                <li>RSVP response</li>
                <li>Gift pledges</li>
                <li>All related records</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Guest
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteGuestButton;