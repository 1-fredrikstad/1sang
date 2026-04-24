'use client';

import { useEffect, useMemo, useState } from 'react';
import { db, Song } from '@/src/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
// import { usePublicPlaylists } from './usePublicPlaylists';
import { usePlaylistSongs } from './usePlaylistSongs';

// Fetches songs from public and private playlists
export function usePlaylistDetails(id: string) {
  const [privateSongs, setPrivateSongs] = useState<Song[]>([]);
  const [loadingPrivateSongs, setLoadingPrivateSongs] = useState(false);

  // 1. Dexie useLiveQuery returns 'undefined' while fetching, then an array
  // const privatePlaylists = useLiveQuery(() => db.playlists.toArray(), []);

  // // 2. Public playlists
  // const { data: publicPlaylists, isLoading: loadingPublicPlaylists } = usePublicPlaylists();

  // // Find the playlist in either source
  // const privatePlaylist = privatePlaylists?.find(({ id: pId }) => pId === id);
  // const publicPlaylist = publicPlaylists?.find(({ id: pId }) => pId === id);
  // const playlist = privatePlaylist || publicPlaylist;

  // All playlists are in Dexie — no API call needed
  const allPlaylists = useLiveQuery(() => db.playlists.toArray(), []);
  const playlist = allPlaylists?.find(({ id: pId }) => pId === id);

  // Song fetching
  const { data: publicSongs, isLoading: loadingPublicSongs } = usePlaylistSongs(id);

  useEffect(() => {
    // Only fetch private songs if we found a private playlist
    if (!playlist || playlist.is_public) return;

    const loadPrivateSongs = async () => {
      setLoadingPrivateSongs(true);
      try {
        const items = await db.playlist_items.where('playlist_id').equals(id).sortBy('position');
        const songIds = items.map((i) => i.song_id);
        const songsFromDb = await db.songs.where('id').anyOf(songIds).toArray();
        const sorted = items
          .map((item) => {
            const song = songsFromDb.find((s) => s.id === item.song_id);
            return song ? { ...song, position: item.position } : null;
          })
          .filter(Boolean) as Song[];
        setPrivateSongs(sorted);
      } finally {
        setLoadingPrivateSongs(false);
      }
    };
    loadPrivateSongs();
  }, [id, playlist]);

  const songs = useMemo(() => {
    if (playlist?.is_public) return publicSongs;
    return privateSongs;
  }, [playlist?.is_public, publicSongs, privateSongs]);

  // const isSearchingCatalogs = privatePlaylists === undefined || loadingPublicPlaylists;

  const isLoadingContent = playlist
    ? playlist.is_public
      ? loadingPublicSongs
      : loadingPrivateSongs
    : false;

  // allPlaylists is undefined while Dexie is initalizing, then array
  const isLoading = allPlaylists === undefined || isLoadingContent;

  return { playlist, songs, isLoading };
}
