'use client';

import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Song } from '@/src/lib/db';
import { db } from '@/src/lib/db';
import { SongBox } from '../SongBox';
import { SongListProps } from '@/src/types/songList';
import TagSelect from '@/src/components/TagSelect';

type Tag = {
  id: string;
  name: string;
};

export function HomePage({ songs = [], isLoading, error }: SongListProps) {
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const matchingSongIds =
    useLiveQuery(async () => {
      if (selectedTags.length === 0) return [];

      const selectedTagIds = selectedTags.map((tag) => tag.id);
      const relations = await db.song_tags.where('tag_id').anyOf(selectedTagIds).toArray();

      return [...new Set(relations.map((relation) => relation.song_id))];
    }, [selectedTags]) ?? [];

  const filteredSongs =
    selectedTags.length === 0
      ? songs
      : songs.filter((song: Song) => matchingSongIds.includes(song.id));

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1 className="mb-5 text-xl">Alle sanger</h1>
      <div className="mb-10 w-fit">
        <TagSelect
          value={selectedTags}
          onChange={setSelectedTags}
          triggerClassName="inline-flex w-fit min-w-[120px] max-w-[400px] justify-between"
        />
      </div>

      {isLoading && <p>Synkroniserer med supabase...</p>}

      {filteredSongs.length === 0 ? (
        <p>Ingen sanger matcher valgte tags.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filteredSongs.map((song: Song) => (
            <li key={song.id}>
              <SongBox song={song} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
