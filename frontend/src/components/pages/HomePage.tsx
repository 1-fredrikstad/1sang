'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Song } from '@/src/lib/db';
import { db } from '@/src/lib/db';
import { SongBox } from '../songs/SongBox';
import { SongListProps } from '@/src/types/songList';
import { SearchField } from '../SearchField';
import { useDebounce } from '@/src/hooks/useDebounce';
import TagSelect from '@/src/components/TagSelect';
import { searchSongs } from '@/src/lib/search/searchSongs';
import { Skeleton } from '@/components/ui/skeleton';

type Tag = {
  id: string;
  name: string;
};

export function HomePage({ songs = [], isLoading, error }: SongListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get('q')
    ? decodeURIComponent(searchParams.get('q') as string)
    : '';

  const debouncedQuery = useDebounce(searchQuery, 300);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isOnline, setIsOnline] = useState(() => window.navigator.onLine);

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value.trim()) {
      // encode special characters (æ, ø, å)
      params.set('q', encodeURIComponent(value));
    } else {
      params.delete('q');
    }

    const queryString = params.toString();

    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const searchedSongs = useMemo(() => {
    return searchSongs(songs, debouncedQuery);
  }, [songs, debouncedQuery]);

  const matchingSongIds =
    useLiveQuery(async () => {
      if (selectedTags.length === 0) return [];

      const selectedTagIds = selectedTags.map((tag) => tag.id);
      const relations = await db.song_tags.where('tag_id').anyOf(selectedTagIds).toArray();

      return [...new Set(relations.map((relation) => relation.song_id))];
    }, [selectedTags]) ?? [];

  const displayedSongs =
    selectedTags.length === 0
      ? searchedSongs
      : searchedSongs.filter((song: Song) => matchingSongIds.includes(song.id));

  if (error) return <div>Error: {error.message}</div>;

  return (
    <main>
      <h1>Alle sanger</h1>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {isOnline && <p className="text-sm text-neutral-500">Synkroniserer med Supabase...</p>}

          {/* Skeletons */}
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-64 rounded-md" />

          <div className="flex flex-col gap-2 mt-2">
            {[...Array(5)].map((_, idx) => (
              <Skeleton key={idx} className="h-16 w-full rounded-md" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <SearchField value={searchQuery} onChange={handleSearchChange} />

          <div className="mb-10 w-fit">
            <TagSelect
              value={selectedTags}
              onChange={setSelectedTags}
              triggerClassName="inline-flex w-fit min-w-[120px] max-w-[400px] justify-between"
            />
          </div>

          {searchQuery.trim() && (
            <p className="mb-3 text-sm text-neutral-500">{displayedSongs.length} treff</p>
          )}

          {displayedSongs.length === 0 ? (
            <p className="text-sm text-neutral-500">
              {searchQuery.trim() && selectedTags.length > 0
                ? 'Ingen sanger matcher søk og valgte tags.'
                : searchQuery.trim()
                  ? 'Ingen sanger matcher søket.'
                  : selectedTags.length > 0
                    ? 'Ingen sanger matcher valgte tags.'
                    : 'Ingen sanger funnet.'}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {displayedSongs.map((song: Song) => (
                <li key={song.id}>
                  <SongBox song={song} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
