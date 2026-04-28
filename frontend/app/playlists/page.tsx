'use client';

import { db } from '@/src/lib/db';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePublicPlaylists } from '@/src/hooks/usePublicPlaylists';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function PlaylistsPage() {
  // Retrieve data (playlists) from Supabase
  const {
    data: publicPlaylists,
    isLoading: loadingPublic,
    error: publicError,
  } = usePublicPlaylists();

  // Retrieve data (playlists) from IndexedDB
  const playlistsFromDexie = useLiveQuery(() => db.playlists.toArray(), []);

  const router = useRouter();

  const loadingPrivate = playlistsFromDexie === undefined;
  const isLoading = loadingPrivate || loadingPublic;
  const [showSkeleton, setShowSkeleton] = useState(true);

  // Show skeleton a minimum amount of time
  useEffect(() => {
    if (!isLoading) {
      const timeout = setTimeout(() => setShowSkeleton(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  // Sort public playlists
  const sortedPublicPlaylists = useMemo(() => {
    return [...(publicPlaylists ?? [])].sort((a, b) =>
      (a.title ?? '')
        .trim()
        .localeCompare((b.title ?? '').trim(), 'no', { sensitivity: 'variant', numeric: true })
    );
  }, [publicPlaylists]);

  // Filter out private playlists and sort
  const sortedPrivatePlaylists = useMemo(() => {
    return [...(playlistsFromDexie ?? [])]
      .filter((playlist) => !playlist.is_public) // Filter out private lists
      .sort((a, b) =>
        (a.title ?? '')
          .trim()
          .localeCompare((b.title ?? '').trim(), 'no', { sensitivity: 'variant', numeric: true })
      );
  }, [playlistsFromDexie]);

  // If public playlists couldn't load
  useEffect(() => {
    if (publicError) {
      toast.error('Feil i å laste spillelister');
      return;
    }
  }, [publicError]);

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
      <div className="w-full max-w-5xl relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h1>Spillelister</h1>
          <button
            className="group flex flex-col items-center cursor-pointer transition-all duration-200 opacity-70 hover:opacity-100"
            onClick={() => router.push('/make_playlist')}
          >
            <PlusIcon className="h-7 w-7 text-foreground" />
            <span className="text-[12px] mt-1  transition-all duration-200 opacity-100 md:opacity-0 md:translate-y-1 md:group-hover:opacity-100 md:group-hover:translate-y-0">
              Lag ny
            </span>
          </button>
        </div>

        {showSkeleton ? (
          <div className="flex flex-col w-full">
            {/* Tabs skeleton  */}
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-9 w-24 rounded-sm" />
              <Skeleton className="h-9 w-24 rounded-sm" />
            </div>

            {/* Playlist row skeletons */}
            <div className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="py-3 pl-1.5 flex flex-col gap-2">
                  <Skeleton className="h-5 w-1/2 max-w-62.5" />
                  <Skeleton className="h-3 w-16 opacity-50" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Public or private tab
          <Tabs defaultValue="public" className="w-full">
            <TabsList className="mb-2">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  aria-label={tab.key}
                  className="px-4 py-2 rounded-sm transition dark:border-none"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/*  Display all playlists from chosen visibility (public/private) */}
            {tabs.map((tab) => (
              <TabsContent value={tab.key} key={tab.key}>
                {tab.data.length === 0 ? (
                  <p className="mt-5 opacity-60 italic">{tab.emptyText}</p>
                ) : (
                  <ul className="flex flex-col divide-y divide-black/10 dark:divide-white/10 w-full">
                    {tab.data.map((playlist) => (
                      <Link
                        key={playlist.id}
                        href={`/playlists/playlist?id=${playlist.id}`}
                        className="block w-full"
                      >
                        <li className="py-3 pl-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition allow-animation cursor-pointer rounded-xs">
                          <div className="flex flex-col">
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
