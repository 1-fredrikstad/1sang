'use client';

import { useMemo, useState } from 'react';
import { Song } from '@/src/lib/db';
import { SongBox } from '../SongBox';
import { SongListProps } from '@/src/types/songList';
import { SearchField } from '../SearchField';
import { useDebounce } from '@/src/hooks/useDebounce';

export function HomePage({ songs = [], isLoading, error }: SongListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  const filteredSongs = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase();

    if (!normalizedQuery) return songs;

    return songs.filter((song: Song) => song.title?.toLowerCase().includes(normalizedQuery));
  }, [songs, debouncedQuery]);

  if (error) return <div>Error: {error.message}</div>;
  if (!songs) return <div>Laster data...</div>;

  return (
    <div>
      <h1 className="mb-5">Alle sanger</h1>

      <SearchField value={searchQuery} onChange={setSearchQuery} />

      {isLoading && <p>Synkroniserer med supabase...</p>}

      {!isLoading && searchQuery.trim() && (
        <p className="mb-3 text-sm text-neutral-500">{filteredSongs.length} treff</p>
      )}

      {filteredSongs.length === 0 && !isLoading ? (
        <p className="text-sm text-neutral-500">Ingen sanger funnet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filteredSongs.map((song: Song) => (
            <li key={song.id}>
              <SongBox song={song} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
