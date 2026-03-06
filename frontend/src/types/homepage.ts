import { Song } from '../lib/db';

export interface HomePageProps {
  songs: Song[] | undefined;
  isLoading: boolean;
  error: Error | null;
}
