import type { Song } from '@/src/lib/db';

function searchVariables(song: Song): string {
  return [song.title, song.chorus, song.verses].filter(Boolean).join(' ').toLowerCase();
}

export function searchSongs(songs: Song[], query: string): Song[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return songs;
  }

  return songs.filter((song) => searchVariables(song).includes(normalizedQuery));
}
