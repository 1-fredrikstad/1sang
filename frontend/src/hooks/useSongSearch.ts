'use client';

import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Song } from '@/src/lib/db';
import { useDebounce } from '@/src/hooks/useDebounce';
import { searchByTitle } from '@/src/lib/search/searchByTitle';

export function useSongSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300);

  const songsFromDb = useLiveQuery(() => db.songs.toArray(), []);

  const allSongs = songsFromDb ?? [];
  const isLoading = songsFromDb === undefined;

  const filteredSongs = useMemo(() => {
    return searchByTitle(allSongs, debouncedQuery);
  }, [allSongs, debouncedQuery]);

  return {
    songs: filteredSongs,
    isLoading,
    query: debouncedQuery,
    totalSongs: allSongs.length,
    resultCount: filteredSongs.length,
  };
}
