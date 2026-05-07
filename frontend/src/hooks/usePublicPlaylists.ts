// implement tanstack query

'use client';

import { useState, useEffect } from 'react';
import { db, Playlist } from '../lib/db';

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
    const fetchPlaylists = async () => {
      try {
        // 1. Fallback to Dexie if offline
        if (!navigator.onLine) {
          const localPlaylists = await db.playlists.filter((p) => !!p.is_public).toArray();
          setData(localPlaylists);
          return;
        }

        // 2. Try fetching from the API
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await fetch('/api/playlists', {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const json = await res.json();

        if (!res.ok || !json.ok) {
          throw new Error('Failed to fetch playlists');
        }

        setData(json.data);
      } catch (err) {
        console.log(err);
        // 3. Fallback to Dexie if the fetch fails
        try {
          const localPlaylists = await db.playlists.filter((p) => !!p.is_public).toArray();
          setData(localPlaylists);
        } catch (dexieErr) {
          setError(dexieErr instanceof Error ? dexieErr.message : 'Unknown error');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  return { data, isLoading, error };
}
