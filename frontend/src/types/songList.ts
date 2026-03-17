import { Song } from '../lib/db';

export type SongListProps = {
  songs: Song[];
  isLoading: boolean;
  error: Error | null;
};
