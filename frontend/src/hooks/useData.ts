'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Song, type Playlist, type Tag } from '@/src/lib/db';
import { syncService } from '@/src/lib/syncService';
import { useOnlineStatus } from './useOnlineStatus';

type TableName =
  | 'songs'
  | 'playlists'
  | 'tags'
  | 'playlist_items'
  | 'song_tags'
  | 'song_links'
  | 'song_suggestions'
  | 'admin_users';

interface UseDataOptions {
  maxAgeMins?: number;
  syncOnMount?: boolean;
}

export function useData<T>(tableName: TableName, options: UseDataOptions = {}) {
  const { maxAgeMins = 5, syncOnMount = true } = options;

  const isOnline = useOnlineStatus();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // offline-first read (Dexie)
  const data = useLiveQuery(() => db.table(tableName).toArray(), [tableName]);

  const sync = useCallback(
    async (forceFresh = false) => {
      if (!navigator.onLine && !forceFresh) return;

      try {
        setIsLoading(true);
        setError(null);

        if (!forceFresh) {
          const stale = await syncService.isTableStale(tableName, maxAgeMins);
          if (!stale) return;
        }

        await syncService.syncTable(tableName, { forceFresh });
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    },
    [tableName, maxAgeMins]
  );

  // sync on mount
  useEffect(() => {
    if (syncOnMount) sync();
  }, [syncOnMount, sync]);

  // sync when connection comes back
  useEffect(() => {
    if (isOnline) sync(true);
  }, [isOnline, sync]);

  // periodic sync while online
  useEffect(() => {
    if (!isOnline) return;
    const id = window.setInterval(() => sync(), maxAgeMins * 60 * 1000);
    return () => window.clearInterval(id);
  }, [isOnline, maxAgeMins, sync]);

  return { data: data as T[] | undefined, isLoading, error, isOnline };
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