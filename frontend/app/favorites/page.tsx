'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import { SongBox } from '@/src/components/SongBox';

export default function FavoritesPage() {
  const songs = useLiveQuery(async () => {
    const favorites = await db.favorites.toArray();

    const result = await Promise.all(favorites.map((fav) => db.songs.get(fav.song_id)));

    return result.filter((song): song is NonNullable<typeof song> => !!song);
  }, []);

  if (!songs) return <p className="p-4">Laster...</p>;

  if (songs.length === 0) {
    return <p className="p-4">Ingen favorittsanger ennå ⭐</p>;
  }

  // TODO: add searchbar and filtering on this page + alphabetic sorting of songs
  return (
    <div>
      <h1 className="mb-5">Dine favorittsanger</h1>
      <ul className="space-y-2">
        {songs.map((song) => (
          <SongBox key={song.id} song={song} />
        ))}
      </ul>
    </div>
  );
}
