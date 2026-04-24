'use client';

import { useEffect, useMemo, useState } from 'react';
import { db, Song } from '@/src/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { usePublicPlaylists } from './usePublicPlaylists';
import { usePlaylistSongs } from './usePlaylistSongs';
import { usePlaylists } from './useData';

// Fetches songs from public and private playlists
export function usePlaylistDetails(id: string) {
  // const [dexieSongs, setDexieSongs] = useState<Song[]>([]);
  // const [loadingDexieSongs, setLoadingDexieSongs] = useState(false);

  const allPlaylists = useLiveQuery(() => db.playlists.toArray(), []);
  const playlist = allPlaylists?.find(({ id: pId }) => pId === id);

  const dexieSongs = useLiveQuery(async () => {
    if (!id) return [];
    const items = await db.playlist_items.where('playlist_id').equals(id).sortBy('position');
    const songIds = items.map((i) => i.song_id);
    if (!songIds.length) return [];
    const songsFromDb = await db.songs.where('id').anyOf(songIds).toArray();
    return items
      .map((item) => {
        const song = songsFromDb.find((s) => s.id === item.song_id);
        return song ? { ...song, position: item.position } : null;
      })
      .filter(Boolean) as Song[];
  }, [id]);

  // Only call API for public playlists and only when online
  const { data: apiSongs } = usePlaylistSongs(playlist?.is_public ? id : undefined);

  // Persist API songs into Dexie so they're available offline next time
  useEffect(() => {
    if (!apiSongs.length || !id) return;

    const persist = async () => {
      await db.songs.bulkPut(apiSongs as Song[]);
      const items = apiSongs.map((song, i) => ({
        playlist_id: id,
        song_id: song.id,
        position: (song.position as number) ?? i,
      }));
      await db.playlist_items.bulkPut(items);
    };

    persist().catch(console.error);
  }, [apiSongs, id]);

  const songs = useMemo(() => {
    if (!playlist) return [];
    // API songs preferred when available (fresher), Dexie as fallback (offline)
    if (playlist.is_public) {
      return apiSongs.length > 0 ? apiSongs : (dexieSongs ?? []);
    }
    return dexieSongs ?? [];
  }, [playlist, apiSongs, dexieSongs]);

  // Only show spinner while Dexie is initializing (undefined)
  // Once it returns (even []), we have enough to render
  const isLoading = allPlaylists === undefined || dexieSongs === undefined;

  // 1. Dexie useLiveQuery returns 'undefined' while fetching, then an array
  const privatePlaylists = useLiveQuery(() => db.playlists.toArray(), []);

  // 2. Public playlists
  const { data: publicPlaylists, isLoading: loadingPublicPlaylists } = usePublicPlaylists();

  // Find the playlist in either source
  const privatePlaylist = privatePlaylists?.find(({ id: pId }) => pId === id);
  const publicPlaylist = publicPlaylists?.find(({ id: pId }) => pId === id);
  const playlist = privatePlaylist || publicPlaylist;

  // // Song fetching
  // const { data: apiSongs, isLoading: loadingApiSongs } = usePlaylistSongs(
  //   playlist?.is_public ? id : undefined
  // );

  // useEffect(() => {
  //   // Only fetch private songs if we found a private playlist
  //   // if (!playlist || playlist.is_public) return;
  //   if (!id) return;

  //   const loadFromDexie = async () => {
  //     setLoadingDexieSongs(true);
  //     try {
  //       const items = await db.playlist_items.where('playlist_id').equals(id).sortBy('position');
  //       const songIds = items.map((i) => i.song_id);
  //       if (songIds.length === 0) {
  //         setDexieSongs([]);
  //         return;
  //       }
  //       const songsFromDb = await db.songs.where('id').anyOf(songIds).toArray();
  //       const sorted = items
  //         .map((item) => {
  //           const song = songsFromDb.find((s) => s.id === item.song_id);
  //           return song ? { ...song, position: item.position } : null;
  //         })
  //         .filter(Boolean) as Song[];
  //       setDexieSongs(sorted);
  //     } finally {
  //       setLoadingDexieSongs(false);
  //     }
  //   };
  //   loadFromDexie();
  // }, [id]);

  // const songs = useMemo(() => {
  //   if (!playlist) return [];
  //   // if (playlist?.is_public) return publicSongs;
  //   // return privateSongs;
  //   if (playlist.is_public) {
  //     // Prefer API songs when online and loaded, fallback to Dexie
  //     return apiSongs.length > 0 ? apiSongs : dexieSongs;
  //   }
  // }, [playlist, apiSongs, dexieSongs]);

  const isSearchingCatalogs = privatePlaylists === undefined || loadingPublicPlaylists;

  // // const isLoadingContent = playlist
  // //   ? playlist.is_public
  // //     ? loadingPublicSongs
  // //     : loadingDexieSongs
  // //   : false;

  const isLoading = isSearchingCatalogs || isLoadingContent;

  return { playlist, songs, isLoading };
}
