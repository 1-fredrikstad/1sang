'use client';

import { db } from '@/src/lib/db';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useLiveQuery } from 'dexie-react-hooks';

type Props = {
  songId: string;
  className?: string;
};

export function StarIcon({ songId, className }: Props) {
  // Reactively reads favorite state from IndexedDB (Dexie)
  const favorite = useLiveQuery(() => db.favorites.get(songId), [songId]);

  // Boolean flag: whether this song is currently favorited
  const starred = !!favorite;

  // Toggle favorite state on click
  const handleClick = async (e: React.MouseEvent) => {
    // Prevent navigation or parent click handlers (important inside links/cards)
    e.preventDefault();
    e.stopPropagation();

    // Remove or add favorite entry depending on current state
    if (starred) {
      await db.favorites.delete(songId);
    } else {
      await db.favorites.put({
        song_id: songId,
        created_at: new Date().toISOString(),
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      aria-label={starred ? 'Fjern fra favoritter' : 'Legg til i favoritter'}
    >
      {/* Filled icon when favorited */}
      {starred ? (
        <StarIconSolid className="size-6 dark:text-yellow-200 text-yellow-500 transition cursor-pointer" />
      ) : (
        // Outline icon when not favorited
        <StarIconOutline className="size-6 text-foreground transition cursor-pointer" />
      )}
    </button>
  );
}
