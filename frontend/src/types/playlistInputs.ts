import { Song } from '../lib/db';

export type PlaylistInputs = {
  id?: string;
  title: string;
  password: string;
  songsInPlaylist: Song[];
  isPublic: boolean;
  duration: number;
};
