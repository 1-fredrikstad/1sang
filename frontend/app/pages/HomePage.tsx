'use client';

import Link from 'next/link';
import { Song } from '@/src/lib/db';
import { HomePageProps } from '@/src/types/homepage';

export function HomePage({ songs = [], isLoading, error }: HomePageProps) {
  if (error) return <div>Error: {error.message}</div>;
  if (!songs) return <div>Laster data...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1>Sanger</h1>

      {isLoading && <p>Synkroniserer med supabase...</p>}

      <ul className="w-full space-y-4">
        {songs.map((song: Song) => (
          <li
            key={song.id}
            className="bg-[#3F3F3F] rounded-xl shadow hover:shadow-md active:scale-[0.99] transition"
          >
            <Link href={`/songs/${song.id}`} className="block w-full py-4 pr-30 pl-4 text-left">
              {song.title ?? '(uten tittel)'}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
