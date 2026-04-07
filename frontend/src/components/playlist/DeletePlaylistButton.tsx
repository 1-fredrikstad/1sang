'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { db } from '@/src/lib/db';
import { toast } from 'react-toastify';
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const supabase = createClient();

  const onDelete = async () => {
    if (!playlistId) {
      toast.error('Mangler playlist-ID');
      return;
    }

    try {
      setIsDeleting(true);
      onDeletingChange?.(true);

      if (!isPublic) {
        const items = await db.playlist_items.where('playlist_id').equals(playlistId).toArray();

        for (const item of items) {
          await db.playlist_items.delete([item.playlist_id, item.song_id]);
        }

        await db.playlists.delete(playlistId);

        sessionStorage.removeItem(`playlist-password-${playlistId}`);
        toast.success('Spilleliste slettet');
        setOpen(false);
        router.replace(redirectTo);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const authPassword = sessionStorage.getItem(`playlist-password-${playlistId}`) ?? '';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`/api/playlists/${playlistId}`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({
          password: authPassword,
        }),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok || !body?.ok) {
        throw new Error('Kunne ikke slette spilleliste');
      }

      sessionStorage.removeItem(`playlist-password-${playlistId}`);
      toast.success('Spilleliste slettet');
      setOpen(false);
      router.replace(redirectTo);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Kunne ikke slette spilleliste');
      onDeletingChange?.(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={isDeleting}
        aria-label="Slett spilleliste"
        type="button"
        className={`p-3 bg-danger hover:cursor-pointer hover:bg-danger-hover rounded ${
          className ?? ''
        }`}
      >
        <Image src="/trash.png" alt="" width={20} height={20} />
      </button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Slette spilleliste?</AlertDialogTitle>
            <AlertDialogDescription>{confirmText}</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="hover:cursor-pointer" disabled={isDeleting}>
              Avbryt
            </AlertDialogCancel>
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
