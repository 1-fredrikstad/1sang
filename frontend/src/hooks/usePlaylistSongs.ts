'use client';

import { useEffect, useState } from 'react';
import { db } from '../lib/db';

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
    if (!id || id.length < 10 || id === 'undefined') {
      setIsLoading(false);
      setData([]);
      return;
    }

    const fetchSongs = async () => {
      setIsLoading(true);
      setError(null);

      // Helper to fetch songs mapped to playlist items from Dexie
      const getFromDexie = async () => {
        const items = await db.playlist_items.where('playlist_id').equals(id).sortBy('position');
        const songIds = items.map((i) => i.song_id);
        const songsFromDb = await db.songs.where('id').anyOf(songIds).toArray();
        return items
          .map((item) => {
            const song = songsFromDb.find((s) => s.id === item.song_id);
            return song ? { ...song, position: item.position } : null;
          })
          .filter(Boolean) as Song[];
      };

      try {
        // 1. Check Dexie first, if the playlist is local, use it and skip the API
        const localPlaylist = await db.playlists.get(id);
        if (localPlaylist) {
          const localSongs = await getFromDexie();
          setData(localSongs);
          return;
        }

        // 2. Fallback to Dexie if we know we are offline
        if (!navigator.onLine) {
          const localSongs = await getFromDexie();
          setData(localSongs);
          return;
        }

        // 3. Try fetching from the API (for remote/public playlists)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(`/api/playlists/${id}/songs`, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const json = await res.json();

        if (!res.ok || !json.ok) {
          const errorMsg = json.error?.message || json.error || 'Failed to fetch playlist songs';
          throw new Error(errorMsg);
        }

        setData(json.data || []);
      } catch (err) {
        console.error(err);

        // 4. Fallback to Dexie if the fetch fails (e.g. poor connection)
        try {
          const localSongs = await getFromDexie();
          if (localSongs.length > 0) {
            setData(localSongs);
          } else {
            setError(err instanceof Error ? err.message : 'Unknown error');
            setData([]);
          }
        } catch (dexieErr) {
          setError(dexieErr instanceof Error ? dexieErr.message : 'Unknown error');
          setData([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, [id]);

  return { data, isLoading, error };
}
