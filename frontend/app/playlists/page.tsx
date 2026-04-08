'use client';

import { db } from '@/src/lib/db';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePublicPlaylists } from '@/src/hooks/usePublicPlaylists';
import { useLiveQuery } from 'dexie-react-hooks';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';

export default function PlaylistsPage() {
  const {
    data: publicPlaylists,
    isLoading: loadingPublic,
    error: publicError,
  } = usePublicPlaylists();

  const playlistsFromDexie = useLiveQuery(() => db.playlists.toArray(), []);

  const loadingPrivate = playlistsFromDexie === undefined;

  if (loadingPrivate || loadingPublic) return <Spinner message="Laster inn spillelister" />;

  if (publicError) {
    toast.error('Feil i å laste spillelister');
    return;
  }

  const privatePlaylists = playlistsFromDexie?.filter((playlist) => !playlist.is_public) ?? [];

  const tabs = [
    {
      key: 'public',
      label: 'Offentlige',
      data: publicPlaylists,
      emptyText: 'Ingen offentlige spillelister ennå',
    },
    {
      key: 'private',
      label: 'Private',
      data: privatePlaylists,
      emptyText: 'Du har ingen private spillelister ennå',
    },
  ];

  return (
    <main className="mb-5 flex flex-col justify-center">
      <div className="max-w-5xl">
        <h1>Spillelister</h1>
        <Tabs defaultValue="public">
          <TabsList className="mt-3">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                aria-label={tab.key}
                className="px-2 py-1.5 rounded-sm transition data-[state=active]:bg-list-bg data-[state=active]:border-0"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent value={tab.key} key={tab.key}>
              {tab.data.length === 0 ? (
                <p className="mt-5">{tab.emptyText}</p>
              ) : (
                <ul className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
                  {tab.data.map((playlist) => (
                    <Link key={playlist.id} href={`/playlists/${playlist.id}`} className="block">
                      <li className="py-3 hover:bg-black/5 dark:hover:bg-white/5 transition allow-animation cursor-pointer rounded-xs">
                        <div className="flex flex-col pl-1.5">
                          <span className="text-base font-medium">
                            {playlist.title.charAt(0).toUpperCase() + playlist.title.slice(1)}
                          </span>
                          <span className="text-xs opacity-60">Spilleliste</span>
                        </div>
                      </li>
                    </Link>
                  ))}
                </ul>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </main>
  );
}
