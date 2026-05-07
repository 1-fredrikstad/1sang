import { Song } from '../lib/db';

export type PlaylistInputs = {
  title: string;
  password: string;
  newPassword?: string;
  songsInPlaylist: Song[];
  isPublic: boolean;
  duration: number;
};
