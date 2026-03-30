'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PlaylistForm from '@/src/components/playlist/PlaylistForm';
import { PlaylistInputs } from '@/src/types/playlistInputs';
import { Song, db } from '@/src/lib/db';
import { toast } from 'react-toastify';

type PlaylistResponse = {
  id: string;
  title: string;
  is_public: boolean;
  expires_at: string | null;
};

type PlaylistItemResponse = {
  playlist_id: string;
  song_id: string;
  position: number;
};

export default function EditPlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [initialValues, setInitialValues] = useState<PlaylistInputs | null>(null);
  const [loading, setLoading] = useState(true);
  const [originalSongs, setOriginalSongs] = useState<Song[]>([]);
  const [isPublicPlaylist, setIsPublicPlaylist] = useState(false);

  useEffect(() => {
    const fetchPlaylistData = async () => {
      try {
        const authPassword =
          typeof window !== 'undefined' ? sessionStorage.getItem(`playlist-password-${id}`) : null;

        // require password before entering page
        if (!authPassword) {
          toast.error('Du må oppgi passord først');
          router.push('/');
          return;
        }

        // 1) Check local private playlist first
        const localPlaylist = await db.playlists.get(id);

        if (localPlaylist && !localPlaylist.is_public) {
          if (localPlaylist.playlist_password !== authPassword) {
            toast.error('Feil passord');
            router.push('/');
            return;
          }

          setIsPublicPlaylist(false);

          const items = await db.playlist_items.where('playlist_id').equals(id).sortBy('position');
          const songIds = items.map((item) => item.song_id);
          const songsFromDb = songIds.length
            ? await db.songs.where('id').anyOf(songIds).toArray()
            : [];

          const songsInPlaylist = items
            .map((item) => songsFromDb.find((song) => song.id === item.song_id))
            .filter(Boolean) as Song[];

          setOriginalSongs(songsInPlaylist);

          setInitialValues({
            title: localPlaylist.title,
            password: '',
            newPassword: '',
            songsInPlaylist,
            isPublic: localPlaylist.is_public,
            duration: localPlaylist.expires_at
              ? Math.max(
                  0,
                  Math.floor((new Date(localPlaylist.expires_at).getTime() - Date.now()) / 1000)
                )
              : 604800,
          });

          return;
        }

        // 2) Fallback to public/server playlist
        const [playlistRes, itemsRes, songsRes] = await Promise.all([
          fetch(`/api/playlists/${id}`),
          fetch(`/api/playlist_items?playlist_id=${id}`),
          fetch('/api/songs'),
        ]);

        const [playlistJson, itemsJson, songsJson] = await Promise.all([
          playlistRes.json(),
          itemsRes.json(),
          songsRes.json(),
        ]);

        if (!playlistJson.ok || !playlistJson.data) {
          throw new Error('Failed to fetch playlist');
        }
        if (!itemsJson.ok) throw new Error('Failed to fetch playlist items');
        if (!songsJson.ok) throw new Error('Failed to fetch songs');

        const playlist: PlaylistResponse = playlistJson.data;
        const items: PlaylistItemResponse[] = itemsJson.data ?? [];
        const allSongs: Song[] = songsJson.data ?? [];

        setIsPublicPlaylist(true);

        const songsInPlaylist = items
          .sort((a, b) => a.position - b.position)
          .map((item) => allSongs.find((song) => song.id === item.song_id))
          .filter(Boolean) as Song[];

        setOriginalSongs(songsInPlaylist);

        setInitialValues({
          title: playlist.title,
          password: '',
          newPassword: '',
          songsInPlaylist,
          isPublic: playlist.is_public,
          duration: playlist.expires_at
            ? Math.max(0, Math.floor((new Date(playlist.expires_at).getTime() - Date.now()) / 1000))
            : 604800,
        });
      } catch (err) {
        console.error(err);
        toast.error('Kunne ikke hente spilleliste');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylistData();
  }, [id, router]);

  const handleSubmit = async (data: PlaylistInputs) => {
    try {
      const authPassword = sessionStorage.getItem(`playlist-password-${id}`) ?? '';

      if (!authPassword) {
        throw new Error('Missing auth password');
      }

      const originalSongIds = originalSongs.map((song) => song.id);
      const updatedSongIds = data.songsInPlaylist.map((song) => song.id);

      const songsToAdd = data.songsInPlaylist.filter((song) => !originalSongIds.includes(song.id));
      const songsToRemove = originalSongs.filter((song) => !updatedSongIds.includes(song.id));

      if (!isPublicPlaylist) {
        const playlist = await db.playlists.get(id);

        if (!playlist || playlist.playlist_password !== authPassword) {
          sessionStorage.removeItem(`playlist-password-${id}`);
          toast.error('Feil passord');
          router.push('/');
          return;
        }

        await db.playlists.update(id, {
          title: data.title,
          is_public: data.isPublic,
          expires_at: data.isPublic
            ? new Date(Date.now() + data.duration * 1000).toISOString()
            : new Date('2100-01-01T00:00:00.000Z').toISOString(),
          updated_at: new Date().toISOString(),
        });

        for (const song of songsToRemove) {
          await db.playlist_items.delete([id, song.id]);
        }

        const currentItems = await db.playlist_items
          .where('playlist_id')
          .equals(id)
          .sortBy('position');
        let nextPosition = currentItems.length + 1;

        for (const song of songsToAdd) {
          await db.playlist_items.put({
            playlist_id: id,
            song_id: song.id,
            position: nextPosition++,
          });
        }

        toast.success('Spilleliste oppdatert');
        sessionStorage.removeItem(`playlist-password-${id}`);
        router.push('/');
        return;
      }

      await Promise.all([
        ...songsToAdd.map(async (song) => {
          const res = await fetch('/api/playlist_items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              playlist_id: id,
              password: authPassword,
              song_id: song.id,
            }),
          });

          const body = await res.json().catch(() => null);
          if (!res.ok || !body?.ok) {
            throw new Error(`Failed to add song ${song.id}`);
          }
        }),
        ...songsToRemove.map(async (song) => {
          const res = await fetch('/api/playlist_items', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              playlist_id: id,
              password: authPassword,
              song_id: song.id,
            }),
          });

          const body = await res.json().catch(() => null);
          if (!res.ok || !body?.ok) {
            throw new Error(`Failed to remove song ${song.id}`);
          }
        }),
      ]);

      const res = await fetch(`/api/playlists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          password: authPassword,
          newPassword: data.newPassword ?? '',
          is_public: data.isPublic,
          expires_at: data.isPublic
            ? new Date(Date.now() + data.duration * 1000).toISOString()
            : new Date('2100-01-01T00:00:00.000Z').toISOString(),
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        const errorText = JSON.stringify(json);

        if (errorText.includes('Invalid password')) {
          sessionStorage.removeItem(`playlist-password-${id}`);
          toast.error('Feil passord');
          router.push('/');
          return;
        }

        throw new Error(errorText);
      }

      toast.success('Spilleliste oppdatert');
      sessionStorage.removeItem(`playlist-password-${id}`);
      router.push('/');
    } catch (err) {
      console.error('Update playlist error:', err);
      toast.error('Kunne ikke oppdatere spilleliste');
    }
  };

  if (loading) return <p className="p-4">Laster...</p>;
  if (!initialValues) return <p className="p-4">Fant ikke spilleliste</p>;

  return <PlaylistForm onSubmit={handleSubmit} initialValues={initialValues} mode="edit" />;
}
