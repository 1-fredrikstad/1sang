'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/src/lib/db';

type Props = {
  songId: string;
  redirectTo?: string;
  className?: string;
  children?: React.ReactNode;
  confirmText?: string;
};

export function DeleteSongButton({
  songId,
  redirectTo = '/songs',
  className,
  children = 'Slett sang',
  confirmText = 'Er du sikker på at du vil slette sangen?',
}: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    if (!songId) {
      alert('Missing song id');
      return;
    }

    if (!confirm(confirmText)) return;

    try {
      setIsDeleting(true);

      const res = await fetch(`/api/songs/${encodeURIComponent(songId)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || 'Sletting feilet');
      }

      // Remove from local offline cache immediately
      await db.songs.delete(songId);

      router.push(redirectTo);
      router.refresh?.();
    } catch (e) {
      console.error(e);
      alert('Kunne ikke slette sang');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button onClick={onDelete} disabled={isDeleting} className={className}>
      {isDeleting ? 'Sletter...' : children}
    </button>
  );
}
