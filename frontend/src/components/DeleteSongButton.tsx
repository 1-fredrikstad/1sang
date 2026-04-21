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
  const [isDeleting, setIsDeleting] = useState(false);
  const isOnline = useOnlineStatus();
  const supabase = createClient();

  const performDelete = async () => {
    if (!isOnline) {
      toast.error('Du er offline. Gå online for å slette sangen.');
      return;
    }

    if (!songId) {
      toast.error('Mangler sang-ID');
      return;
    }

    try {
      setIsDeleting(true);
      onDeletingChange?.(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: Record<string, string> = {};

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`/api/songs/${encodeURIComponent(songId)}`, {
        method: 'DELETE',
        headers,
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(body?.error ?? 'Sletting feilet');
      }

      await db.songs.delete(songId);
      toast.success('Sangen ble slettet');
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
            <AlertDialogTitle>{confirmText}</AlertDialogTitle>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" aria-label="Avbryt" disabled={isDeleting}>
              Avbryt
            </AlertDialogCancel>
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
