// implement tanstack query

'use client';

import { useState, useEffect } from 'react';
import { Playlist } from '../lib/db';

type State = {
  data: Playlist[];
  isLoading: boolean;
  error: string | null;
};

export function usePublicPlaylists(): State {
  const [data, setData] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip API call entirely if offline: avoids long timeout hang
    if (!navigator.onLine) {
      setIsLoading(false);
      return;
    }

    const fetchPlaylists = async () => {
      try {
        const res = await fetch('/api/playlists');
        const json = await res.json();

        if (!res.ok || !json.ok) {
          throw new Error('Failed to fetch playlists');
        }

        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  return { data, isLoading, error };
}
