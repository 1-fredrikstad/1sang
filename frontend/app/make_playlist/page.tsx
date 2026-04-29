'use client';

import { SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import PlaylistForm from '@/src/components/playlist/PlaylistForm';
import { PlaylistInputs } from '@/src/types/playlistInputs';
import { savePlaylist } from '@/src/lib/playlists/savePlaylists';
import { useRouter } from 'next/navigation';

export default function MakePlaylistPage() {
  const router = useRouter();
  const handleFormSubmit: SubmitHandler<PlaylistInputs> = async (data) => {
    try {
      // Prevent creating empty playlists
      if (!data.songsInPlaylist?.length) throw new Error('Velg minst én sang');

      const result = await savePlaylist(data);

      // Success message if playlist was made successfully, else warning if not synced correctly
      if (result.type === 'public') {
        toast.success('Offentlig spilleliste opprettet!');
        // } else if (result.type === 'pending') {
        //   toast.warning('Lagret lokalt – vil synkroniseres når du er online');
      } else {
        toast.success('Privat spilleliste lagret lokalt!');
      }
      router.push(
        result.type === 'public'
          ? `/playlists/playlist?id=${result.serverId}`
          : `/playlists/playlist?id=${result.localId}`
      );
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Noe gikk galt');
    }
  };

  return (
    <main>
      <PlaylistForm onSubmit={handleFormSubmit} />
    </main>
  );
}
