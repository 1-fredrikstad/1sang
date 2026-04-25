'use client';

import { useSearchParams } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import BackButton from '@/src/components/BackButton';
import { usePlaylistDetails } from '@/src/hooks/usePlaylistDetails';
import { PlaylistSongItem } from '@/src/components/playlist/PlaylistSongItem';
import { Separator } from '@/components/ui/separator';
import PlaylistSettingsMenu from '@/src/components/playlist/PlaylistSettingsMenu';
import { useEffect, useState } from 'react';
import Campfire from '@/src/components/Campfire';
import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';
import CampfirePage from '@/app/campfire/page';

export default function PlaylistClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const { playlist, songs, isLoading } = usePlaylistDetails(id || '');

  const { isAdmin } = useAuth();
  const adminValue = isAdmin ?? false;

  // Track ID of failed playlist
  const [failedId, setFailedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !playlist && id) {
      // Gives Dexie 400ms to pass the data to react
      const timer = setTimeout(() => setFailedId(id), 400);
      return () => clearTimeout(timer);
    }
  }, [isLoading, playlist, id]);

  if (isLoading) {
    return <Spinner message="Laster inn spilleliste" />;
  }

  if (!playlist) {
    // Only show the error if the current id failed safety delay
    if (failedId !== id) return <Spinner message="Laster inn spilleliste" />;

    return <CampfirePage message="Spillelisten finnes ikke" />;
  }

  return (
    <main className="flex flex-col justify-center gap-4">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3 relative">
          <BackButton />
          <h1 className="title-headline capitalize-first">{playlist.title}</h1>
          <div className="absolute right-0">
            <PlaylistSettingsMenu
              playlist={playlist}
              editUrl={`/playlists/playlist/edit?id=${playlist.id}`}
              isAdmin={adminValue}
            />
          </div>
        </div>

        <div className="flex flex-row text-xs opacity-60 ml-9">
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
            <PlaylistSongItem key={song.id} song={song} index={i} playlistId={playlist.id} />
          ))}
        </div>
      )}
    </main>
  );
}
