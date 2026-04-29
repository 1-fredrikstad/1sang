'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/src/lib/db';
import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';
import { toast } from 'sonner';
import { createClient } from '@/src/lib/supabase/client';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

type Props = {
  songId: string;
  redirectTo?: string;
  className?: string;
  children?: React.ReactNode;
  confirmText?: string;
  onDeletingChange?: (value: boolean) => void;
};

export function DeleteSongButton({
  songId,
  redirectTo = '/',
  className,
  confirmText = 'Er du sikker på at du vil slette sangen?',
  onDeletingChange,
}: Props) {
  const router = useRouter();

  // Tracks delete state to prevent duplicate requests and disable UI
  const [isDeleting, setIsDeleting] = useState(false);

  // Used to block deletion when offline
  const isOnline = useOnlineStatus();

  const supabase = createClient();

  // Performs actual delete request (server + local DB cleanup)
  const performDelete = async () => {
    // Prevent deletion when offline
    if (!isOnline) {
      toast.error('Du er offline. Gå online for å slette sangen.');
      return;
    }

    // Guard against invalid input
    if (!songId) {
      toast.error('Mangler sang-ID');
      return;
    }

    try {
      setIsDeleting(true);
      onDeletingChange?.(true);

      // Get auth session for API authorization
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: Record<string, string> = {};

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      // Call backend delete endpoint
      const res = await fetch(`/api/songs/${encodeURIComponent(songId)}`, {
        method: 'DELETE',
        headers,
      });

      const body = await res.json().catch(() => null);

      // Handle server-side errors
      if (!res.ok) {
        throw new Error(body?.error ?? 'Sletting feilet');
      }

      // Remove song locally from IndexedDB cache
      await db.songs.delete(songId);

      toast.success('Sangen ble slettet');

      // Redirect after deletion
      router.replace(redirectTo);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Kunne ikke slette sang');
      onDeletingChange?.(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      {/* Trigger button that opens confirmation dialog */}
      <AlertDialogTrigger asChild>
        <Button
          disabled={isDeleting}
          aria-label="Slett sang"
          variant={'destructive'}
          className={`hover:cursor-pointer text-red-500 ${className ?? ''}`}
        >
          Slett sang
        </Button>
      </AlertDialogTrigger>

      <AlertDialogPortal>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            {/* Confirmation title */}
            <AlertDialogTitle>{confirmText}</AlertDialogTitle>
          </AlertDialogHeader>

          <AlertDialogFooter>
            {/* Cancel action */}
            <AlertDialogCancel variant="outline" aria-label="Avbryt" disabled={isDeleting}>
              Avbryt
            </AlertDialogCancel>

            {/* Confirm destructive action */}
            <AlertDialogAction
              variant="destructive"
              onClick={performDelete}
              aria-label="Bekreft sletting av sang"
              disabled={isDeleting}
            >
              Slett
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
}
