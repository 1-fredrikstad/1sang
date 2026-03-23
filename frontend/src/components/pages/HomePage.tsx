'use client';

import { Song } from '@/src/lib/db';
import { SongBox } from '../SongBox';
import { SongListProps } from '@/src/types/songList';
import { SearchField } from '../SearchField';

export function HomePage({ songs = [], isLoading, error }: SongListProps) {
  if (error) return <div>Error: {error.message}</div>;
  if (!songs) return <div>Laster data...</div>;

  return (
    <div>
      <h1 className="mb-5">Alle sanger</h1>

      <SearchField />

      {isLoading && <p>Synkroniserer med supabase...</p>}

      <ul className="flex flex-col gap-2">
        {songs.map((song: Song) => (
          <li key={song.id}>
            <SongBox song={song} />
          </li>
        ))}
      </ul>
    </div>
  );
}
