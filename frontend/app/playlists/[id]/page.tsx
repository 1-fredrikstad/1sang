'use client';

import { useParams } from 'next/navigation';
import Spinner from '@/src/components/login/Spinner';
import BackButton from '@/src/components/BackButton';
import { usePlaylistDetails } from '@/src/hooks/usePlaylistDetails';
import { PlaylistSongItem } from '@/src/components/playlist/PlaylistSongItem';
import { Separator } from '@/components/ui/separator';
import PlaylistSettingsMenu from '@/src/components/playlist/PlaylistSettingsMenu';

export default function PlaylistDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string | undefined;
  const { playlist, songs, isLoading } = usePlaylistDetails(id || '');

  if (!id || isLoading) return <Spinner />;

  if (!playlist) {
    return (
      <div className="text-center py-12">
        <p>Spilleliste ikke funnet</p>
        <BackButton />
      </div>
    );
  }

  return (
    <main className="mb-5  flex flex-col justify-center max-w-5xl mx-auto gap-4">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 relative">
          <BackButton />
          <h1 className="text-2xl font-bold tracking-tight">{playlist.title}</h1>
          <div className="absolute right-0">
            <PlaylistSettingsMenu
              playlist={playlist}
              canEdit={!!playlist.playlist_password}
              editUrl={`/playlists/${playlist.id}/edit`}
            />
          </div>
        </div>

        <div className="flex flex-row gap-2 text-xs opacity-60 ml-9">
          <span>{playlist.is_public ? 'Offentlig spilleliste' : 'Privat spilleliste'}</span>
        </div>
      </div>
      <Separator />

      {/* Songs */}
      {!songs || songs.length === 0 ? (
        <p className="text-center opacity-60 py-16">Ingen sanger ennå</p>
      ) : (
        <div className="space-y-2">
          {songs.map((song, i) => (
            <PlaylistSongItem key={song.id} song={song} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}
