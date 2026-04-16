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
  const favorite = useLiveQuery(() => db.favorites.get(songId), [songId]);
  const starred = !!favorite;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
      {starred ? (
        <StarIconSolid className="size-6 dark:text-yellow-200 text-yellow-500 transition cursor-pointer" />
      ) : (
        <StarIconOutline className="size-6 text-foreground transition cursor-pointer" />
      )}
    </button>
  );
}
