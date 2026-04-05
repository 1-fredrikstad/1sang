'use client';

import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Song } from '@/src/lib/db';
import { db } from '@/src/lib/db';
import { SongBox } from '../SongBox';
import { SongListProps } from '@/src/types/songList';
import { SearchField } from '../SearchField';
import { useDebounce } from '@/src/hooks/useDebounce';
import TagSelect from '@/src/components/TagSelect';
import { searchByTitle } from '@/src/lib/search/searchByTitle';

type Tag = {
  id: string;
  name: string;
};

export function HomePage({ songs = [], isLoading, error }: SongListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const searchedSongs = useMemo(() => {
    return searchByTitle(songs, debouncedQuery);
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
    <div>
      <h1 className="mb-5 text-xl">Alle sanger</h1>

      <SearchField value={searchQuery} onChange={setSearchQuery} />

      <div className="mb-10 w-fit">
        <TagSelect
          value={selectedTags}
          onChange={setSelectedTags}
          triggerClassName="inline-flex w-fit min-w-[120px] max-w-[400px] justify-between"
        />
      </div>

      {isLoading && <p>Synkroniserer med supabase...</p>}

      {!isLoading && searchQuery.trim() && (
        <p className="mb-3 text-sm text-neutral-500">{displayedSongs.length} treff</p>
      )}

      {!isLoading && displayedSongs.length === 0 ? (
        <p className="text-sm text-neutral-500">
          {selectedTags.length > 0
            ? 'Ingen sanger matcher søk og valgte tags.'
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
    </div>
  );
}
