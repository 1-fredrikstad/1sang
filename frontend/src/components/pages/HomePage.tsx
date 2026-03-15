'use client';

import { Song } from '@/src/lib/db';
import { HomePageProps } from '@/src/types/homepage';
import { SongBox } from '../SongBox';

export function HomePage({ songs = [], isLoading, error }: HomePageProps) {
  if (error) return <div>Error: {error.message}</div>;
  if (!songs) return <div>Laster data...</div>;

  return (
    <div>
      <h1 className="mb-5">Alle sanger</h1>

      {isLoading && <p>Synkroniserer med supabase...</p>}

      <ul className="flex flex-col gap-2">
        {songs.map((song: Song) => (
          <SongBox key={song.id} song={song} />
        ))}
      </ul>
    </div>
  );
}
