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
import { ScoredSong } from '@/src/types/scoredSong';
import { useTagFilter } from '@/src/context/TagFilterContext';
import { Skeleton } from '@/components/ui/skeleton';

export function HomePage({ songs = [], isLoading, error }: SongListProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local input state for search field
  const [value, setValue] = useState(searchParams.get('q') ?? '');

  // Debounced version to avoid recalculating search on every keystroke
  const debouncedQuery = useDebounce(value, 300);

  // Global tag filter state
  const { selectedTags, setSelectedTags } = useTagFilter();

  // Used to avoid rewriting URL on initial render
  const isFirstRender = useRef(true);

  // Controls skeleton visibility delay
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    // Delay removing skeleton slightly for smoother UX
    if (!isLoading) {
      const timeout = setTimeout(() => setShowSkeleton(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  useEffect(() => {
    // Skip updating URL on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const params = new URLSearchParams();

    // Sync search query to URL (?q=...)
    if (debouncedQuery.trim()) {
      params.set('q', debouncedQuery.trim());
    }

    const qs = params.toString();
    const newUrl = qs ? `${pathname}?${qs}` : pathname;

    window.history.replaceState(null, '', newUrl);
  }, [debouncedQuery, pathname]);

  // Full-text search across title + lyrics (client-side)
  const searchedSongs = useMemo(() => {
    return searchSongs(songs, debouncedQuery);
  }, [songs, debouncedQuery]);

  // Lookup matching song IDs from IndexedDB based on selected tags
  const matchingSongIds =
    useLiveQuery(async () => {
      if (selectedTags.length === 0) return [];

      const selectedTagIds = selectedTags.map((tag) => tag.id);

      // Get all song-tag relations for selected tags
      const relations = await db.song_tags.where('tag_id').anyOf(selectedTagIds).toArray();

      // Deduplicate song IDs
      return [...new Set(relations.map((relation) => relation.song_id))];
    }, [selectedTags]) ?? [];

  // Combine text search + tag filtering
  const filteredSongs: ScoredSong[] =
    selectedTags.length === 0
      ? searchedSongs
      : searchedSongs.filter((item) => matchingSongIds.includes(item.song.id));

  // Sort by score first, then Norwegian alphabetical order
  const sortedSongs = useMemo(() => {
    return [...filteredSongs].sort((a, b) => {
      // Primary sort: relevance score
      const scoreDiff = b.score - a.score;
      if (scoreDiff !== 0) return scoreDiff;

      // Secondary sort: stable alphabetical ordering
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

      {/* Skeleton shown while initial loading state is active */}
      {showSkeleton ? (
        <div className="flex flex-col gap-4 mt-1">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-64 rounded-md" />

          {/* List skeleton placeholders */}
          <div className="flex flex-col gap-2 mt-2">
            {[...Array(5)].map((_, idx) => (
              <Skeleton key={idx} className="h-16 w-full rounded-md" />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Search input */}
          <SearchField value={value} onChange={setValue} />

          {/* Tag filter dropdown */}
          <div className="mb-10 w-fit">
            <TagSelect
              value={selectedTags}
              onChange={setSelectedTags}
              triggerClassName="inline-flex w-fit min-w-[120px] max-w-[400px] justify-between"
            />
          </div>

          {/* Result count (only shown when searching) */}
          {value.trim() && (
            <p className="mb-3 text-sm text-opacity-80">{filteredSongs.length} treff</p>
          )}

          {/* Empty state handling */}
          {sortedSongs.length === 0 ? (
            <p className="text-sm text-opacity-80">
              {value.trim() && selectedTags.length > 0
                ? 'Ingen sanger matcher søk og valgte tags.'
                : value.trim()
                  ? 'Ingen sanger matcher søket.'
                  : selectedTags.length > 0
                    ? 'Ingen sanger matcher valgte tags.'
                    : 'Ingen sanger funnet.'}
            </p>
          ) : (
            // Song list
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
