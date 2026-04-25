'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { usePathname, useSearchParams } from 'next/navigation';
import { db } from '@/src/lib/db';
import { SongBox } from '../songs/SongBox';
import { SongListProps } from '@/src/types/songList';
import { SearchField } from '../SearchField';
import { useDebounce } from '@/src/hooks/useDebounce';
import TagSelect from '@/src/components/TagSelect';
import { searchSongs } from '@/src/lib/search/searchSongs';
import { Skeleton } from '@/components/ui/skeleton';
import { ScoredSong } from '@/src/types/scoredSong';
import { useTagFilter } from '@/src/context/TagFilterContext';

export function HomePage({ songs = [], isLoading, error }: SongListProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(searchParams.get('q') ?? '');
  const debouncedQuery = useDebounce(value, 300);

  const { selectedTags, setSelectedTags } = useTagFilter();
  const [isOnline, setIsOnline] = useState(() => window.navigator.onLine);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const params = new URLSearchParams();

    if (debouncedQuery.trim()) {
      params.set('q', debouncedQuery.trim());
    } else {
      params.delete('q');
    }

    const qs = params.toString();
    const newUrl = qs ? `${pathname}?${qs}` : pathname;

    window.history.replaceState(null, '', newUrl);
  }, [debouncedQuery, pathname]);

  // Track online/offline state for UX feedback
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

  // Text search (debounced), for both title and lyrics
  const searchedSongs = useMemo(() => {
    return searchSongs(songs, debouncedQuery);
  }, [songs, debouncedQuery]);

  // Get songs matching selected tags from IndexedDB (Dexie)
  const matchingSongIds =
    useLiveQuery(async () => {
      if (selectedTags.length === 0) return [];

      const selectedTagIds = selectedTags.map((tag) => tag.id);
      const relations = await db.song_tags.where('tag_id').anyOf(selectedTagIds).toArray();

      return [...new Set(relations.map((relation) => relation.song_id))];
    }, [selectedTags]) ?? [];

  // Combine text search + tag filtering
  const filteredSongs: ScoredSong[] =
    selectedTags.length === 0
      ? searchedSongs
      : searchedSongs.filter((item) => matchingSongIds.includes(item.song.id));

  // Sort songs
  const sortedSongs = useMemo(() => {
    return [...filteredSongs].sort((a, b) => {
      // 1. Score first
      const scoreDiff = b.score - a.score;
      if (scoreDiff !== 0) return scoreDiff;

      // 2. fallback: alphabetical sort
      // 'no' - gives correct norwegian sorting (æ, ø, å)
      // sensitivity 'base' - lowercase and uppercase doesn't affect sorting
      return (a.song.title ?? '').trim().localeCompare((b.song.title ?? '').trim(), 'no', {
        sensitivity: 'base',
        numeric: true,
      });
    });
  }, [filteredSongs]);

  if (error) return <div>Error: {error.message}</div>;

  return (
    <main>
      <h1>Alle sanger</h1>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {/* Only show sync message when online */}
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
          <SearchField value={value} onChange={setValue} />

          <div className="mb-10 w-fit">
            <TagSelect
              value={selectedTags}
              onChange={setSelectedTags}
              triggerClassName="inline-flex w-fit min-w-[120px] max-w-[400px] justify-between"
            />
          </div>

          {value.trim() && (
            <p className="mb-3 text-sm text-neutral-500">{filteredSongs.length} treff</p>
          )}

          {sortedSongs.length === 0 ? (
            <p className="text-sm text-neutral-500">
              {value.trim() && selectedTags.length > 0
                ? 'Ingen sanger matcher søk og valgte tags.'
                : value.trim()
                  ? 'Ingen sanger matcher søket.'
                  : selectedTags.length > 0
                    ? 'Ingen sanger matcher valgte tags.'
                    : 'Ingen sanger funnet.'}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {sortedSongs.map((item: ScoredSong) => (
                <li key={item.song.id}>
                  <SongBox song={item.song} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
