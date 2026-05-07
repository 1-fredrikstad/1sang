'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import { SongBox } from '@/src/components/songs/SongBox';
import { Spinner } from '@/components/ui/spinner';
import { useMemo } from 'react';

export default function FavoritesPage() {
  // Retrieve songs from IndexedDB (Dexie)
  const songs = useLiveQuery(async () => {
    const favorites = await db.favorites.toArray();

    const result = await Promise.all(favorites.map((fav) => db.songs.get(fav.song_id)));

    return result.filter((song): song is NonNullable<typeof song> => !!song);
  }, []);

  // Sort using Norwegian locale (handles æ, ø, å correctly)
  const sortedSongs = useMemo(() => {
    return [...(songs ?? [])].sort((a, b) =>
      (a.title ?? '')
        .trim()
        .localeCompare((b.title ?? '').trim(), 'no', { sensitivity: 'variant', numeric: true })
    );
  }, [songs]);

  // If songs haven't been loaded show spinner
  if (!songs) return <Spinner message="Laster inn favoritter" />;

  return (
    <div>
      <h1>Dine favorittsanger</h1>
      {/* If there are no favorite songs, show message*/}
      {songs.length === 0 ? (
        <p>Du har ingen favorittsanger ennå</p>
      ) : (
        <ul className="space-y-2">
          {/* Display all favorite songs */}
          {sortedSongs.map((song) => (
            <SongBox key={song.id} song={song} />
          ))}
        </ul>
      )}
    </div>
  );
}
