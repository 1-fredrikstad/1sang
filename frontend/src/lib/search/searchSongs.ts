import type { Song } from '@/src/lib/db';

// Normalize text for case-insensitive searching
function normalize(text?: string | string[]) {
  if (!text) return '';

  if (Array.isArray(text)) {
    return text.join(' ').toLowerCase();
  }

  return text.toLowerCase();
}

// Calculate relevance score for one song
function scoreSong(song: Song, query: string) {
  const q = query.toLowerCase();
  const title = normalize(song.title);
  const lyrics = normalize([song.chorus ?? '', ...(song.verses ?? [])]);

  let score = 0;

  // Strong title match
  if (title === q) score += 100;
  if (title.startsWith(q)) score += 80;
  else if (title.includes(q)) score += 50;

  // Weak lyrics match
  if (lyrics.includes(q)) score += 5;

  // Prefer shorter matching titles
  if (title.includes(q)) {
    score += Math.max(0, 10 - title.length * 0.1);
  }

  return score;
}

export function searchSongs(songs: Song[], query: string) {
  const q = query.trim().toLowerCase();

  // No search: return all songs with neutral score
  if (!q) return songs.map((song) => ({ song, score: 0 }));

  return songs
    .map((song) => ({
      song,
      score: scoreSong(song, q),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}
