'use client';

import { useAuth } from '@/src/context/AuthContext';
import { toast } from 'react-toastify';
import PlaylistForm from '@/src/components/playlist/PlaylistForm';
import { PlaylistInputs } from '@/src/types/playlistInputs';
import { savePlaylist } from '@/src/lib/playlists/savePlaylists';
import { SavePlaylistResult } from '@/src/types/savePlaylists';

export default function MakePlaylistPage() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <p className="text-center mt-10">Laster...</p>;
  }

  const handleFormSubmit = async (data: PlaylistInputs): Promise<SavePlaylistResult> => {
    // Prevent creating empty playlists
    if (!data.songsInPlaylist?.length) throw new Error('Velg minst én sang');

    const result = await savePlaylist(data);

    // Success message if playlist was made successfully, else warning if not synced correctly
    if (result.type === 'public') {
      toast.success('Offentlig spilleliste opprettet!');
    } else if (result.type === 'pending') {
      toast.warning('Lagret lokalt – vil synkroniseres når du er online');
    } else {
      toast.success('Privat spilleliste lagret lokalt!');
    }

    return result;
  };

  return (
    <main>
      <PlaylistForm onSubmit={handleFormSubmit} />
    </main>
  );
}
