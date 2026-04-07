'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PlaylistForm from '@/src/components/playlist/PlaylistForm';
import { PlaylistInputs } from '@/src/types/playlistInputs';
import { Song, db } from '@/src/lib/db';
import { toast } from 'react-toastify';
import { createClient } from '@/src/lib/supabase/client';
import { DeletePlaylistButton } from '@/src/components/playlist/DeletePlaylistButton';

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
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) return {};

    return {
      Authorization: `Bearer ${session.access_token}`,
    };
  };

  const replaceLocalPlaylistItems = async (playlistId: string, songs: Song[]) => {
    const existingItems = await db.playlist_items.where('playlist_id').equals(playlistId).toArray();

    for (const item of existingItems) {
      await db.playlist_items.delete([item.playlist_id, item.song_id]);
    }

    for (const [index, song] of songs.entries()) {
      await db.playlist_items.put({
        playlist_id: playlistId,
        song_id: song.id,
        position: index + 1,
      });
    }
  };

  useEffect(() => {
    const fetchPlaylistData = async () => {
      try {
        const authHeaders = await getAuthHeaders();

        const meRes = await fetch('/api/users/me', {
          headers: authHeaders,
        });

        const meJson = await meRes.json().catch(() => null);
        const admin = !!meJson?.ok && !!meJson?.isAdmin;
        setIsAdmin(admin);

        const localPlaylist = await db.playlists.get(id);

        // Private/local playlist: no password required to enter edit page
        if (localPlaylist && !localPlaylist.is_public) {
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
            isPublic: false,
            duration: localPlaylist.expires_at
              ? Math.max(
                  0,
                  Math.floor((new Date(localPlaylist.expires_at).getTime() - Date.now()) / 1000)
                )
              : 604800,
          });

          return;
        }

        // Public playlist: require password unless admin
        const authPassword =
          typeof window !== 'undefined' ? sessionStorage.getItem(`playlist-password-${id}`) : null;

        if (!admin) {
          if (!authPassword) {
            toast.error('Du må oppgi passord først', {
              toastId: 'playlist-auth-required',
            });
            router.push('/');
            return;
          }

          const verifyRes = await fetch('/api/playlists/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...authHeaders,
            },
            body: JSON.stringify({
              playlist_id: id,
              password: authPassword,
            }),
          });

          const verifyJson = await verifyRes.json().catch(() => null);

          if (!verifyRes.ok || !verifyJson?.ok || !verifyJson?.data) {
            sessionStorage.removeItem(`playlist-password-${id}`);
            toast.error('Du må oppgi gyldig passord først', {
              toastId: 'playlist-auth-invalid',
            });
            router.push('/');
            return;
          }
        }

        const [playlistRes, itemsRes, songsRes] = await Promise.all([
          fetch(`/api/playlists/${id}`, {
            headers: authHeaders,
          }),
          fetch(`/api/playlist_items?playlist_id=${id}`, {
            headers: authHeaders,
          }),
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
          isPublic: true,
          duration: playlist.expires_at
            ? Math.max(0, Math.floor((new Date(playlist.expires_at).getTime() - Date.now()) / 1000))
            : 604800,
        });
      } catch (err) {
        console.error('fetchPlaylistData error:', err);
        toast.error('Kunne ikke hente spilleliste', {
          toastId: 'playlist-fetch-error',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlaylistData();
    }
  }, [id, router]);

  const handleSubmit = async (data: PlaylistInputs) => {
    try {
      const authPassword = sessionStorage.getItem(`playlist-password-${id}`) ?? '';
      const authHeaders = await getAuthHeaders();

      if (!data.songsInPlaylist?.length) {
        throw new Error('Velg minst én sang');
      }

      const originalSongIds = originalSongs.map((song) => song.id);
      const updatedSongIds = data.songsInPlaylist.map((song) => song.id);

      const songsToAdd = data.songsInPlaylist.filter((song) => !originalSongIds.includes(song.id));
      const songsToRemove = originalSongs.filter((song) => !updatedSongIds.includes(song.id));

      // PRIVATE -> PUBLIC
      if (!isPublicPlaylist && data.isPublic) {
        const localPlaylist = await db.playlists.get(id);

        if (!localPlaylist) {
          throw new Error('Fant ikke spilleliste');
        }

        const passwordToUse =
          data.newPassword && data.newPassword.trim() !== ''
            ? data.newPassword.trim()
            : localPlaylist.playlist_password?.trim();

        if (!passwordToUse) {
          throw new Error('Du må angi passord for å gjøre spillelisten offentlig');
        }

        const createRes = await fetch('/api/playlists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
          body: JSON.stringify({
            action: 'create',
            title: data.title,
            password: passwordToUse,
            is_public: true,
            expires_at: new Date(Date.now() + data.duration * 1000).toISOString(),
          }),
        });

        const createJson = await createRes.json().catch(() => null);

        if (!createRes.ok || !createJson?.ok || !createJson?.data?.id) {
          throw new Error('Kunne ikke opprette offentlig spilleliste');
        }

        const newPlaylistId = createJson.data.id as string;

        for (const song of data.songsInPlaylist) {
          const addRes = await fetch('/api/playlist_items', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...authHeaders,
            },
            body: JSON.stringify({
              playlist_id: newPlaylistId,
              password: passwordToUse,
              song_id: song.id,
            }),
          });

          const addJson = await addRes.json().catch(() => null);

          if (!addRes.ok || !addJson?.ok) {
            throw new Error(`Kunne ikke legge til sang ${song.id}`);
          }
        }

        await db.playlists.delete(id);

        const localItems = await db.playlist_items.where('playlist_id').equals(id).toArray();
        for (const item of localItems) {
          await db.playlist_items.delete([item.playlist_id, item.song_id]);
        }

        sessionStorage.setItem(`playlist-password-${newPlaylistId}`, passwordToUse);
        toast.success('Spilleliste gjort offentlig');
        return;
      }

      // PRIVATE -> PRIVATE
      if (!isPublicPlaylist) {
        const playlist = await db.playlists.get(id);

        if (!playlist) {
          toast.error('Fant ikke spilleliste');
          router.push('/');
          return;
        }

        await db.playlists.update(id, {
          title: data.title,
          is_public: false,
          expires_at: null,
          updated_at: new Date().toISOString(),
          playlist_password:
            data.newPassword && data.newPassword.trim() !== ''
              ? data.newPassword.trim()
              : playlist.playlist_password,
        });

        await db.songs.bulkPut(data.songsInPlaylist);
        await replaceLocalPlaylistItems(id, data.songsInPlaylist);

        toast.success('Spilleliste oppdatert');
        return;
      }

      // PUBLIC -> PRIVATE
      if (isPublicPlaylist && !data.isPublic) {
        if (!isAdmin && !authPassword) {
          throw new Error('Missing auth password');
        }

        await db.songs.bulkPut(data.songsInPlaylist);

        await db.playlists.put({
          id,
          title: data.title,
          playlist_password:
            data.newPassword && data.newPassword.trim() !== ''
              ? data.newPassword.trim()
              : authPassword,
          synced: 0,
          is_public: false,
          expires_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: 1,
          server_id: undefined,
          has_password: false,
        });

        await replaceLocalPlaylistItems(id, data.songsInPlaylist);

        const deleteRes = await fetch(`/api/playlists/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
          body: JSON.stringify({
            password: authPassword,
          }),
        });

        const deleteJson = await deleteRes.json().catch(() => null);

        if (!deleteRes.ok || !deleteJson?.ok) {
          throw new Error('Kunne ikke fjerne offentlig spilleliste fra server');
        }

        sessionStorage.removeItem(`playlist-password-${id}`);
        toast.success('Spilleliste gjort privat og lagret lokalt');
        return;
      }

      // PUBLIC -> PUBLIC
      if (!isAdmin && !authPassword) {
        throw new Error('Missing auth password');
      }

      await Promise.all([
        ...songsToAdd.map(async (song) => {
          const res = await fetch('/api/playlist_items', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...authHeaders,
            },
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
            headers: {
              'Content-Type': 'application/json',
              ...authHeaders,
            },
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
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          title: data.title,
          password: authPassword,
          newPassword: data.newPassword ?? '',
          is_public: true,
          expires_at: new Date(Date.now() + data.duration * 1000).toISOString(),
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

      if (!isAdmin) {
        sessionStorage.removeItem(`playlist-password-${id}`);
      }
    } catch (err) {
      console.error('Update playlist error:', err);
      toast.error(err instanceof Error ? err.message : 'Kunne ikke oppdatere spilleliste');
    }
  };

  if (loading || isAdmin === null) return <p className="p-4">Laster...</p>;
  if (!initialValues) return <p className="p-4">Fant ikke spilleliste</p>;

  return (
    <main>
      <PlaylistForm onSubmit={handleSubmit} initialValues={initialValues} mode="edit" />
      <div className="flex justify-center">
        <DeletePlaylistButton playlistId={id} isPublic={isPublicPlaylist} />
      </div>
    </main>
  );
}
