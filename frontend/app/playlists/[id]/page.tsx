'use client';

export const dynamic = 'force-static';

import { useParams } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import BackButton from '@/src/components/BackButton';
import { usePlaylistDetails } from '@/src/hooks/usePlaylistDetails';
import { PlaylistSongItem } from '@/src/components/playlist/PlaylistSongItem';
import { Separator } from '@/components/ui/separator';
import PlaylistSettingsMenu from '@/src/components/playlist/PlaylistSettingsMenu';
import { useEffect, useState } from 'react';
import { createClient } from '@/src/lib/supabase/client';

export default function PlaylistDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string | undefined;

  const { playlist, songs, isLoading } = usePlaylistDetails(id || '');

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const loadAdmin = async () => {
      if (!navigator.onLine) {
        setIsAdmin(false);
        return;
      }
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setIsAdmin(false);
          return;
        }

        const res = await fetch('/api/users/me', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const json = await res.json();

        if (json?.ok) {
          setIsAdmin(!!json.isAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Failed to load admin status', err);
        setIsAdmin(false);
      }
    };

    loadAdmin();
  }, []);

  if (!id || isLoading || isAdmin === null) {
    return <Spinner message="Laster inn spilleliste" />;
  }

  if (!playlist) {
    return (
      <div className="text-center py-12">
        <p>Spilleliste ikke funnet</p>
        <BackButton />
      </div>
    );
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
              editUrl={`/playlists/${playlist.id}/edit`}
              isAdmin={isAdmin}
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
