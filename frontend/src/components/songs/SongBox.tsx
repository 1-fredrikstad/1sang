'use client';

import Link from 'next/link';
import { Song } from '@/src/lib/db';
import { StarIcon } from '@/src/components/songs/StarIcon';

type SongBoxProps = {
  song: Song;
  mode?: 'link' | 'select';
  hoverVariant?: 'default' | 'none' | 'green' | 'red';
  playlistId?: string;
};

const modeStyles = {
  link: {
    hideStar: false,
  },
  select: {
    hideStar: true,
  },
} as const;

export function SongBox({
  song,
  mode = 'link',
  hoverVariant = 'default',
  playlistId,
}: SongBoxProps) {
  const config = modeStyles[mode];

  const hoverClasses =
    {
      default: '',
      none: 'active:scale-[1] cursor-default',
      green: 'hover:bg-green-100 dark:hover:bg-green-950/60',
      red: 'hover:bg-red-100 dark:hover:bg-red-950/60',
    }[hoverVariant] ?? '';

  const content = (
    <article
      className={`relative allow-animation rounded-sm outline-1 dark:bg-list-bg outline-[#0000001a] dark:shadow-xs dark:shadow-black hover:shadow-sm active:scale-[0.99] transition ${hoverClasses}`}
    >
      <div className="block w-full py-4 pr-10 pl-4 text-left capitalize-first">
        {song.title ?? '(uten tittel)'}
      </div>

      {!config.hideStar && (
        <StarIcon songId={song.id} className="absolute right-2 top-1/2 -translate-y-1/2" />
      )}
    </article>
  );

  if (mode === 'select') {
    return <div className="cursor-pointer">{content}</div>;
  }

  return (
    <Link
      href={playlistId ? `/songs/${song.slug}?playlistId=${playlistId}` : `/songs/${song.slug}`}
      className="block"
    >
      {content}
    </Link>
  );
}
