'use client';

import Link from 'next/link';
import { Song, db } from '@/src/lib/db';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { useLiveQuery } from 'dexie-react-hooks';

type SongBoxProps = {
  song: Song;
};

export function SongBox({ song }: SongBoxProps) {
  const favorite = useLiveQuery(() => db.favorites.get(song.id), [song.id]);
  const starred = !!favorite;

  const handleStarClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (starred) {
      await db.favorites.delete(song.id);
    } else {
      await db.favorites.put({
        song_id: song.id,
        created_at: new Date().toISOString(),
      });
    }
  };

  return (
    <article className="relative rounded-sm outline-1 dark:bg-list-bg outline-[#0000001a] dark:shadow-xs dark:shadow-black hover:shadow-sm active:scale-[0.99] transition">
      <Link href={`/songs/${song.slug}`} className="block w-full py-4 pr-10 pl-4 text-left">
        {song.title ?? '(uten tittel)'}
      </Link>

      <button
        type="button"
        onClick={handleStarClick}
        aria-label={starred ? 'Fjern fra favoritter' : 'Legg til i favoritter'}
        className="absolute right-2 top-1/2 -translate-y-1/2"
      >
        {starred ? (
          <StarIconSolid className="h-6 w-6 dark:text-yellow-200 text-yellow-500 transition cursor-pointer" />
        ) : (
          <StarIconOutline className="h-6 w-6 text-foreground transition cursor-pointer" />
        )}
      </button>
    </article>
  );
}
