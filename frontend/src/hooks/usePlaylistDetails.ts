'use client';

import { useEffect, useMemo, useState } from 'react';
import { db, Song } from '@/src/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { usePublicPlaylists } from './usePublicPlaylists';
import { usePlaylistSongs } from './usePlaylistSongs';

// Fetches songs from public and private playlists
export function usePlaylistDetails(id: string) {
  const [privateSongs, setPrivateSongs] = useState<Song[]>([]);
  const [loadingPrivateSongs, setLoadingPrivateSongs] = useState(false);

  // Fetch playlists
  const privatePlaylists = useLiveQuery(() => db.playlists.toArray(), []);
  const privatePlaylist = privatePlaylists?.find(({ id: playlistId }) => playlistId === id);

  const { data: publicPlaylists, isLoading: loadingPublicPlaylists } = usePublicPlaylists();
  const publicPlaylist =
    publicPlaylists && publicPlaylists.find(({ id: playlistId }) => playlistId === id);

  const playlist = privatePlaylist || publicPlaylist;

  // Get songs from public playlists via API helper
  const { data: publicSongs, isLoading: loadingPublicSongs } = usePlaylistSongs(id);

  // Get songs from private playlists via Dexie
  useEffect(() => {
    if (!playlist || playlist.is_public) return;

    const loadPrivateSongs = async () => {
      setLoadingPrivateSongs(true);

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
      setLoadingPrivateSongs(false);
    };

    loadPrivateSongs();
  }, [id, playlist]);

  // Choose right playlist depending on private or public
  const songs = useMemo(() => {
    if (playlist?.is_public) {
      return publicSongs;
    }
    return privateSongs;
  }, [playlist?.is_public, publicSongs, privateSongs]);

  // Choose loading status
  const isLoading =
    loadingPublicPlaylists ||
    (!playlist ? true : playlist.is_public ? loadingPublicSongs : loadingPrivateSongs);

  return { playlist, songs: songs, isLoading };
}
