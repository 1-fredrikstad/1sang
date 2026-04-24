'use client';

import { useEffect, useState } from 'react';

type Song = {
  id: string;
  title: string;
  chorus: string;
  verses: string[];
  position?: number;
  [key: string]: unknown;
  has_chords: boolean;
};

type State = {
  data: Song[];
  isLoading: boolean;
  error: string | null;
};

export function usePlaylistSongs(id?: string): State {
  const [data, setData] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.onLine) {
      setIsLoading(false);
      return;
    }

    if (!id || id.length < 10 || id === 'undefined') {
      setIsLoading(false);
      setData([]);
      return;
    }

    const fetchSongs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(`/api/playlists/${id}/songs`);
        const json = await res.json();

        if (!res.ok || !json.ok) {
          const errorMsg = json.error?.message || json.error || 'Failed to fetch playlist songs';
          throw new Error(errorMsg);
        }

        setData(json.data || []);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, [id]);

  return { data, isLoading, error };
}
