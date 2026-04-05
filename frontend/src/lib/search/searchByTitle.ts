import type { Song } from '@/src/lib/db';

export function searchByTitle(songs: Song[], query: string): Song[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return songs;
  }

  return songs.filter((song) => song.title?.toLowerCase().includes(normalizedQuery));
}
