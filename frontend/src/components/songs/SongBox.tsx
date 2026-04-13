'use client';

import Link from 'next/link';
import { Song } from '@/src/lib/db';
import { StarIcon } from '@/src/components/songs/StarIcon';

type SongBoxProps = {
  song: Song;
};

export function SongBox({ song }: SongBoxProps) {
  return (
    <article className="relative allow-animation rounded-sm outline-1 dark:bg-list-bg outline-[#0000001a] dark:shadow-xs dark:shadow-black hover:shadow-sm active:scale-[0.99] transition">
      <Link
        href={`/songs/${song.id}`}
        className="block w-full py-4 pr-10 pl-4 text-left capitalize-first"
      >
        {song.title ?? '(uten tittel)'}
      </Link>
      <StarIcon songId={song.id} className="absolute right-2 top-1/2 -translate-y-1/2" />
    </article>
  );
}
