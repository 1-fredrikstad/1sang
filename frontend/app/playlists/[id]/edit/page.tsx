'use client';

import { useState } from 'react';
import { usePlaylistDetails } from '@/src/hooks/usePlaylistDetails';
import { useParams } from 'next/navigation';
import PlaylistForm from '@/src/components/playlist/PlaylistForm';
import Spinner from '@/src/components/login/Spinner';
import { PlaylistInputs } from '@/src/types/playlistInputs';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { savePlaylist } from '@/src/lib/playlists/savePlaylists';
import BackButton from '@/src/components/BackButton';

export default function EditPlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const { playlist, songs, isLoading } = usePlaylistDetails(id);

  const [passwordInput, setPasswordInput] = useState('');
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [showPasswordHint, setShowPasswordHint] = useState(false);

  if (isLoading) return <Spinner />;
  if (!playlist) return <p className="text-center mt-10">Spilleliste ikke funnet</p>;

  // Very simple verifier
  const verifyPassword = () => {
    if (passwordInput === playlist.playlist_password) {
      setPasswordVerified(true);
    } else {
      setShowPasswordHint(true);
    }
  };

  // Map backend playlist object to PlaylistInputs for playlistform
  const mappedDefaultValues: PlaylistInputs = {
    title: playlist.title,
    password: playlist.playlist_password,
    songsInPlaylist: songs,
    isPublic: playlist.is_public,
    duration: 604800,
  };

  // Update handler
  const handleUpdate = async (data: PlaylistInputs) => {
    try {
      const result = await savePlaylist({ ...data, id: playlist.id });
      toast.success('Spilleliste oppdatert!');
      return result;
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Noe gikk galt');
      throw err;
    }
  };

  if (!passwordVerified) {
    return (
      <div className="max-w-md mx-auto mt-10 flex flex-col gap-4">
        <BackButton />
        <h2 className="text-xl font-bold">Angi passord for å redigere</h2>
        <input
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          placeholder="Passord"
          className="p-2 border rounded"
        />
        <p className="opacity-80">
          {' '}
          {showPasswordHint || (showPasswordHint && !passwordInput) ? 'Feil passord!' : ''}
        </p>
        <Button onClick={verifyPassword} className="w-20">
          Bekreft
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <PlaylistForm onSubmit={handleUpdate} defaultValues={mappedDefaultValues} />
    </div>
  );
}
