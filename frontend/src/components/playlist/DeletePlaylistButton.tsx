'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/src/lib/db';
import { toast } from 'sonner';
import { createClient } from '@/src/lib/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

type Props = {
  playlistId: string;
  isPublic: boolean;
  redirectTo?: string;
  className?: string;
  confirmText?: string;
  onDeletingChange?: (value: boolean) => void;
};

export function DeletePlaylistButton({
  playlistId,
  isPublic,
  redirectTo = '/',
  className,
  confirmText = 'Er du sikker på at du vil slette spillelisten?',
  onDeletingChange,
}: Props) {
  const router = useRouter();

  // Tracks deletion loading state
  const [isDeleting, setIsDeleting] = useState(false);

  // Controls confirmation dialog visibility
  const [open, setOpen] = useState(false);

  const supabase = createClient();

  const onDelete = async () => {
    // Guard: prevent invalid delete call
    if (!playlistId) {
      toast.error('Mangler playlist-ID');
      return;
    }

    try {
      setIsDeleting(true);
      onDeletingChange?.(true);

      // -------------------------
      // LOCAL (private) playlist
      // -------------------------
      if (!isPublic) {
        // Remove local DB playlist items first
        const items = await db.playlist_items.where('playlist_id').equals(playlistId).toArray();

        for (const item of items) {
          await db.playlist_items.delete([item.playlist_id, item.song_id]);
        }

        // Remove playlist itself from IndexedDB
        await db.playlists.delete(playlistId);

        // Clear stored password from session storage
        sessionStorage.removeItem(`playlist-password-${playlistId}`);

        toast.success('Spilleliste slettet');

        setOpen(false);
        router.replace(redirectTo);
        return;
      }

      // -------------------------
      // PUBLIC playlist (server)
      // -------------------------

      // Get Supabase session for auth header
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Password stored locally (used for API verification)
      const authPassword = sessionStorage.getItem(`playlist-password-${playlistId}`) ?? '';

      // Build request headers dynamically
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Attach JWT if available
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      // Send delete request to API
      const res = await fetch(`/api/playlists/${playlistId}`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({
          password: authPassword,
        }),
      });

      const body = await res.json().catch(() => null);

      // Fail-safe validation
      if (!res.ok || !body?.ok) {
        throw new Error('Kunne ikke slette spilleliste');
      }

      // Cleanup after successful deletion
      sessionStorage.removeItem(`playlist-password-${playlistId}`);
      toast.success('Spilleliste slettet');

      setOpen(false);
      router.replace(redirectTo);
    } catch (e) {
      console.error(e);

      toast.error(e instanceof Error ? e.message : 'Kunne ikke slette spilleliste');

      // Reset external loading state if parent tracks it
      onDeletingChange?.(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <Button
        onClick={() => setOpen(true)}
        disabled={isDeleting}
        aria-label="Slett spilleliste"
        type="button"
        variant={'destructive'}
        className={`hover:cursor-pointer text-red-500 ${className ?? ''}`}
      >
        Slett spilleliste
      </Button>

      {/* Confirmation dialog */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Slette spilleliste?</AlertDialogTitle>

            {/* Customizable confirmation text */}
            <AlertDialogDescription>{confirmText}</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            {/* Cancel action */}
            <AlertDialogCancel className="hover:cursor-pointer" disabled={isDeleting}>
              Avbryt
            </AlertDialogCancel>

            {/* Confirm delete action */}
            <AlertDialogAction
              className="hover:cursor-pointer"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                void onDelete();
              }}
            >
              {isDeleting ? 'Sletter...' : 'Slett'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
