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

// Configuration per mode (controls UI behavior like hiding star icon)
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

  // Hover styling based on context (selection vs normal view)
  const hoverClasses =
    {
      default: '',
      none: 'active:scale-[1] cursor-default',
      green: 'hover:bg-[#91c57580] dark:hover:bg-[#91c57554]',
      red: 'hover:bg-red-100 dark:hover:bg-[#623334]',
    }[hoverVariant] ?? '';

  // Shared UI content for both link and select modes
  const content = (
    <article
      className={`relative allow-animation rounded-sm outline-1 dark:bg-list-bg outline-[#0000001a] dark:shadow-xs dark:shadow-black hover:shadow-sm active:scale-[0.99] transition ${hoverClasses}`}
    >
      {/* Song title */}
      <div className="block w-full py-4 pr-10 pl-4 text-left capitalize-first">
        {song.title ?? '(uten tittel)'}
      </div>

      {/* Favorite/star icon (hidden in select mode) */}
      {!config.hideStar && (
        <StarIcon
          songId={song.id}
          className="absolute right-2 top-1/2 -translate-y-1/2"
          aria-label="Favorittstjerne-knapp"
        />
      )}
    </article>
  );

  // Select mode: used in pickers (no navigation)
  if (mode === 'select') {
    return <div className="cursor-pointer">{content}</div>;
  }

  // Link mode: navigates to song page (optionally within playlist context)
  return (
    <Link
      href={
        playlistId
          ? `/songs?slug=${song.slug}&playlistId=${playlistId}`
          : `/songs?slug=${song.slug}`
      }
      className="block"
    >
      {content}
    </Link>
  );
}
