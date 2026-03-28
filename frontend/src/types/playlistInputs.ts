import { Song } from '../lib/db';

export type PlaylistInputs = {
  title: string;
  password: string;
  songsInPlaylist: Song[];
  isPublic: boolean;
  duration: number;
};
