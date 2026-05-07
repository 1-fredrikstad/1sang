import { Song } from '../lib/db';

export type ScoredSong = {
  song: Song;
  score: number;
};
