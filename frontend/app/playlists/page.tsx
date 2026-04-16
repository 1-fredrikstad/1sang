'use client';

import { db } from '@/src/lib/db';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePublicPlaylists } from '@/src/hooks/usePublicPlaylists';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

export default function PlaylistsPage() {
  // Retrieve data (playlists) from Supabase
  const {
    data: publicPlaylists,
    isLoading: loadingPublic,
    error: publicError,
  } = usePublicPlaylists();

  // Retrieve data (playlists) from IndexedDB
  const playlistsFromDexie = useLiveQuery(() => db.playlists.toArray(), []);

  const loadingPrivate = playlistsFromDexie === undefined;
  const isLoading = loadingPrivate || loadingPublic;

  // Sort public playlists
  const sortedPublicPlaylists = useMemo(() => {
    return [...(publicPlaylists ?? [])].sort((a, b) =>
      (a.title ?? '').trim().localeCompare((b.title ?? '').trim(), 'no', { sensitivity: 'variant' })
    );
  }, [publicPlaylists]);

  // Filter out private playlists and sort
  const sortedPrivatePlaylists = useMemo(() => {
    return [...(playlistsFromDexie ?? [])]
      .filter((playlist) => !playlist.is_public) // Filter out private lists
      .sort((a, b) =>
        (a.title ?? '')
          .trim()
          .localeCompare((b.title ?? '').trim(), 'no', { sensitivity: 'variant' })
      );
  }, [playlistsFromDexie]);

  // If public playlists couldn't load
  if (publicError) {
    toast.error('Feil i å laste spillelister');
    return;
  }

  // Tab between public and private playlists
  const tabs = [
    {
      key: 'public',
      label: 'Offentlige',
      data: sortedPublicPlaylists,
      emptyText: 'Ingen offentlige spillelister ennå',
    },
    {
      key: 'private',
      label: 'Private',
      data: sortedPrivatePlaylists,
      emptyText: 'Du har ingen private spillelister ennå',
    },
  ];

  return (
    <main className="mb-5 flex flex-col justify-center">
      <div className="max-w-5xl">
        <h1>Spillelister</h1>

        {isLoading ? (
          <div className="flex flex-col gap-4 mt-3">
            {/* Skeletons */}
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>

            <div className="flex flex-col gap-2 mt-2">
              {[...Array(5)].map((_, idx) => (
                <Skeleton key={idx} className="h-12 w-full rounded-md" />
              ))}
            </div>
          </div>
        ) : (
          // Public or private tab
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

            {/*  Display all playlists from chosen visibility (public/private) */}
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
                            <span className="text-base font-medium capitalize-first">
                              {playlist.title}
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
        )}
      </div>
    </main>
  );
}
