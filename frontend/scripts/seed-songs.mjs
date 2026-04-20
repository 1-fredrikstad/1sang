import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

// Seeds songs from the json file into supabase database
// In this case, the json file (sanger.json) is not included in the repo for copyright purposes
const inputArg = process.argv[2] || './sanger.json';
const inputPath = path.resolve(process.cwd(), inputArg);

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Normalizes a song object by trimming strings and ensuring the verses are an array of non-empty strings
function normalizeSong(song) {
  const verses = Array.isArray(song?.verses)
    ? song.verses.map((v) => String(v).trim()).filter(Boolean)
    : [];

  return {
    title: String(song?.title ?? '').trim(),
    melody: song?.melody ? String(song.melody).trim() || null : null,
    author: song?.author ? String(song.author).trim() || null : null,
    chorus: song?.chorus ? String(song.chorus).trim() || null : null,
    verses,
    spotify_youtube: song?.spotify_youtube ? String(song.spotify_youtube).trim() || null : null,
  };
}

const raw = await fs.readFile(inputPath, 'utf8');
const parsed = JSON.parse(raw);

// Ensures that the json file is either an array of songs or an object with a "songs" array
const sourceSongs = Array.isArray(parsed)
  ? parsed
  : Array.isArray(parsed?.songs)
    ? parsed.songs
    : null;

if (!sourceSongs) {
  throw new Error('Input JSON must be an array or an object with a songs array');
}

const normalizedSongs = sourceSongs.map(normalizeSong).filter((song) => song.title.length > 0);

if (normalizedSongs.length === 0) {
  throw new Error('No valid songs found after normalization');
}

const chunkSize = 200;
for (let i = 0; i < normalizedSongs.length; i += chunkSize) {
  const chunk = normalizedSongs.slice(i, i + chunkSize);
  const { error } = await supabase.from('songs').insert(chunk);
  if (error) throw error;
  console.log(`Inserted ${i + chunk.length}/${normalizedSongs.length}`);
}

console.log('Seeding complete');
