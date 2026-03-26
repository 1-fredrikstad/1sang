'use client';

import { useEffect, useState } from 'react';

type Song = {
  id: string;
  title: string;
  lyrics: string;
  position?: number;
  [key: string]: unknown;
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
    if (!id) return;

    const fetchSongs = async () => {
      try {
        const res = await fetch(`/api/playlists/${id}/songs`);
        const json: { ok: boolean; data?: Song[] } = await res.json();

        if (!res.ok || !json.ok) {
          throw new Error('Failed to fetch playlist songs');
        }

        setData(json.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, [id]);

  return { data, isLoading, error };
}
