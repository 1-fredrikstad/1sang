'use client';

import { useEffect, useState } from 'react';
import { db, Song } from '@/src/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { usePublicPlaylists } from './usePublicPlaylists';
import { usePlaylistSongs } from './usePlaylistSongs';

export function usePlaylistDetails(id: string) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loadingPrivateSongs, setLoadingPrivateSongs] = useState(false);

  // playlists
  const privatePlaylists = useLiveQuery(() => db.playlists.toArray(), []);
  const privatePlaylist = privatePlaylists?.find((p) => p.id === id);

  const { data: publicPlaylists, isLoading: loadingPublicPlaylists } = usePublicPlaylists();
  const publicPlaylist = publicPlaylists?.find((p) => p.id === id);

  const playlist = privatePlaylist || publicPlaylist;

  // public songs
  const { data: publicSongs, isLoading: loadingPublicSongs } = usePlaylistSongs(id);

  // private songs
  useEffect(() => {
    if (!playlist || playlist.is_public) return;

    const load = async () => {
      setLoadingPrivateSongs(true);

      const items = await db.playlist_items.where('playlist_id').equals(id).sortBy('position');

      const songIds = items.map((i) => i.song_id);

      const playlistSongs = await db.songs.where('id').anyOf(songIds).toArray();

      const sorted = items
        .map((item) => {
          const song = playlistSongs.find((s) => s.id === item.song_id);
          return song ? { ...song, position: item.position } : null;
        })
        .filter(Boolean) as Song[];

      setSongs(sorted);
      setLoadingPrivateSongs(false);
    };

    load();
  }, [id, playlist]);

  // public songs
  useEffect(() => {
    if (!playlist?.is_public || !publicSongs) return;
    const timeout = setTimeout(() => setSongs(publicSongs), 0);
    return () => clearTimeout(timeout);
  }, [publicSongs, playlist]);

  const isLoading =
    loadingPublicPlaylists || (playlist?.is_public ? loadingPublicSongs : loadingPrivateSongs);

  return { playlist, songs, isLoading };
}
