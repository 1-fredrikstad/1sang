'use client';

import { useEffect, useMemo, useState } from 'react';
import { db, Song } from '@/src/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
// import { usePublicPlaylists } from './usePublicPlaylists';
import { usePlaylistSongs } from './usePlaylistSongs';
import { usePlaylists } from './useData';

// Fetches songs from public and private playlists
export function usePlaylistDetails(id: string) {
  const [dexieSongs, setDexieSongs] = useState<Song[]>([]);
  const [loadingDexieSongs, setLoadingDexieSongs] = useState(false);

  // 1. Dexie useLiveQuery returns 'undefined' while fetching, then an array
  // const privatePlaylists = useLiveQuery(() => db.playlists.toArray(), []);

  // // 2. Public playlists
  // const { data: publicPlaylists, isLoading: loadingPublicPlaylists } = usePublicPlaylists();

  // // Find the playlist in either source
  // const privatePlaylist = privatePlaylists?.find(({ id: pId }) => pId === id);
  // const publicPlaylist = publicPlaylists?.find(({ id: pId }) => pId === id);
  // const playlist = privatePlaylist || publicPlaylist;

  // All playlists are in Dexie — no API call needed
  const { data: allPlaylists, isLoading: loadingPlaylists } = usePlaylists();
  const playlist = allPlaylists?.find(({ id: pId }) => pId === id);

  // Song fetching
  const { data: apiSongs, isLoading: loadingApiSongs } = usePlaylistSongs(
    playlist?.is_public ? id : undefined
  );

  useEffect(() => {
    // Only fetch private songs if we found a private playlist
    // if (!playlist || playlist.is_public) return;
    if (!id) return;

    const loadFromDexie = async () => {
      setLoadingDexieSongs(true);
      try {
        const items = await db.playlist_items.where('playlist_id').equals(id).sortBy('position');
        const songIds = items.map((i) => i.song_id);
        if (songIds.length === 0) {
          setDexieSongs([]);
          return;
        }
        const songsFromDb = await db.songs.where('id').anyOf(songIds).toArray();
        const sorted = items
          .map((item) => {
            const song = songsFromDb.find((s) => s.id === item.song_id);
            return song ? { ...song, position: item.position } : null;
          })
          .filter(Boolean) as Song[];
        setDexieSongs(sorted);
      } finally {
        setLoadingDexieSongs(false);
      }
    };
    loadFromDexie();
  }, [id]);

  const songs = useMemo(() => {
    if (!playlist) return [];
    // if (playlist?.is_public) return publicSongs;
    // return privateSongs;
    if (playlist.is_public) {
      // Prefer API songs when online and loaded, fallback to Dexie
      return apiSongs.length > 0 ? apiSongs : dexieSongs;
    }
  }, [playlist, apiSongs, dexieSongs]);

  // const isSearchingCatalogs = privatePlaylists === undefined || loadingPublicPlaylists;

  // const isLoadingContent = playlist
  //   ? playlist.is_public
  //     ? loadingPublicSongs
  //     : loadingDexieSongs
  //   : false;

  // Only block on loading if we have no data yet at all
  const isLoading =
    (loadingPlaylists && allPlaylists.length === 0) ||
    (loadingDexieSongs && dexieSongs.length === 0);

  return { playlist, songs, isLoading };
}
