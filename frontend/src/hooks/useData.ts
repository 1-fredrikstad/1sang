'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Song, type Playlist, type Tag, SongSuggestion } from '@/src/lib/db';
import { syncService } from '@/src/lib/syncService';
import { useOnlineStatus } from './useOnlineStatus';

type TableName =
  | 'songs'
  | 'playlists'
  | 'tags'
  | 'playlist_items'
  | 'song_tags'
  | 'song_suggestions'
  | 'users';

interface UseDataOptions {
  maxAgeMins?: number;
  syncOnMount?: boolean;
}

export function useData<T>(tableName: TableName, options: UseDataOptions = {}) {
  const { maxAgeMins = 5, syncOnMount = true } = options;

  const isOnline = useOnlineStatus();
  const [isLoading, setIsLoading] = useState(syncOnMount); // true by default
  const [error, setError] = useState<Error | null>(null);

  const [stableData, setStableData] = useState<T[] | undefined>(undefined);

  // offline-first read (Dexie)
  const data = useLiveQuery(() => db.table(tableName).toArray(), [tableName]);

  const sync = useCallback(
    async (forceFresh = false) => {
      try {
        // 1. Start loading
        setIsLoading(true);
        setError(null);

        // 2. Check online status
        const online = typeof navigator !== 'undefined' ? navigator.onLine : true;

        // If offline, return early. Because we are inside the 'try',
        // it will immediately jump to 'finally' and turn off the loading skeleton
        if (!online && !forceFresh) return;

        // 3. Check if data is stale
        if (!forceFresh) {
          const stale = await syncService.isTableStale(tableName, maxAgeMins);
          if (!stale) return;
        }

        // Create a 3-second timeout promise
        const timeoutPromise = new Promise<void>((_, reject) => {
          setTimeout(() => reject(new Error('Sync timed out (Lie-Fi fallback)')), 3000);
        });

        // 4. Fetch new data

        // Race the sync against the 3-second timeout.
        // If the internet is dead, this throws an error after 3s, instantly
        // jumping to the 'catch' block and unlocking UI
        await Promise.race([syncService.syncTable(tableName, { forceFresh }), timeoutPromise]);
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : '';
        // If it's our deliberate timeout, fail silently
        if (!errMsg.includes('Lie-Fi fallback')) {
          setError(e instanceof Error ? e : new Error('Unknown error'));
        }
      } finally {
        // 5. Always stop loading -> unlock UI
        setIsLoading(false);
      }
    },
    [tableName, maxAgeMins]
  );

  /// --- Sync effects ---
  // intentional suppressions because this is intentional sync behaviour

  // sync on mount
  useEffect(() => {
    if (syncOnMount) sync(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [syncOnMount, sync]);

  // sync when connection comes back
  useEffect(() => {
    if (isOnline) sync(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, [isOnline, sync]);

  // stabilize data from useLiveQuery
  useEffect(() => {
    if (data !== undefined) setStableData(data); // eslint-disable-line react-hooks/set-state-in-effect
  }, [data]);

  // Periodic sync is handled globally by syncService.startAutoSync() in useGlobalSync.
  // No per-component interval needed.

  return {
    data: stableData ?? [],
    isLoading: stableData === undefined,
    error,
    isOnline,
  };
}

// hooks for each table
export function useSongs(options?: UseDataOptions) {
  return useData<Song>('songs', options);
}
export function usePlaylists(options?: UseDataOptions) {
  return useData<Playlist>('playlists', options);
}
export function useTags(options?: UseDataOptions) {
  return useData<Tag>('tags', options);
}
export function useSongSuggestions(options?: UseDataOptions) {
  return useData<SongSuggestion>('song_suggestions', options);
}
