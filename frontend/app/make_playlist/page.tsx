'use client';

import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import PlaylistForm from '@/src/components/playlist/PlaylistForm';
import { PlaylistInputs } from '@/src/types/playlistInputs';

export default function MakePlaylistPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        router.replace('/');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  if (isLoading) {
    return <p className="text-center mt-10">Laster...</p>;
  }

  if (!user) {
    return <p className="text-center mt-10">Ingen tilgang.</p>;
  }

  const handleFormSubmit: SubmitHandler<PlaylistInputs> = async (data) => {
    let playlistId: string | undefined;
    try {
      // Prevent creating empty playlists
      if (!data.songsInPlaylist || data.songsInPlaylist.length === 0) {
        throw new Error('Velg minst én sang før du oppretter spilleliste');
      }

      // Convert seconds to a expiration date
      const duration = data.duration || 604800;
      const expires_at = new Date(Date.now() + duration * 1000).toISOString();

      // Create playlist
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          title: data.title,
          password: data.password,
          is_public: data.isPublic,
          expires_at,
        }),
      });

      const body = await res.json();

      if (!res.ok || !body.ok) {
        // const errorText = JSON.stringify(body).toLowerCase();
        // if (errorText.includes('duplicate')) {
        //   throw new Error('En spilleliste med denne tittelen finnes allerede');
        // }
        throw new Error('Kunne ikke lage spilleliste');
      }

      playlistId = body.data?.id;
      if (!playlistId) throw new Error('Ingen playlist ID returnert');

      // Add each song to the playlist
      for (const song of data.songsInPlaylist) {
        const addRes = await fetch('/api/playlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'add_item',
            playlist_id: playlistId,
            song_id: song.id,
            password: data.password,
          }),
        });

        const addBody = await addRes.json();
        if (!addBody.ok) {
          console.error('Failed to add song', song.title, addBody.error);
        }
      }

      toast.success('Spilleliste opprettet!');
      // Redirect to homepage after creation - TODO: may change to playlist page instead when implemented
      router.push('/');
    } catch (error) {
      // If a playlist was created, delete it
      if (playlistId) {
        await fetch('/api/playlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete',
            playlist_id: playlistId,
            password: data.password,
          }),
        });
      }
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Noe gikk galt');
    }
  };

  return (
    <main>
      <PlaylistForm onSubmit={handleFormSubmit} />
    </main>
  );
}
