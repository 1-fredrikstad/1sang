'use client';

import { useParams } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Song } from '@/src/lib/db';
import BackButton from '@/src/components/BackButton';

export default function SongPage() {
  const { id } = useParams<{ id: string }>();

  const song = useLiveQuery<Song | undefined>(
    () => (id ? db.songs.get(id) : undefined),
    [id]
  );

  if (!song) {
    return (
      <div className="flex justify-center items-center min-h-screen text-center">
        Laster sang...
      </div>
    );
  }

  return (
    <main className="relative w-full max-w-300 mx-auto text-center px-4">
       
      <div className="absolute **:left-5 cursor-pointer">
        <BackButton />
      </div>
   
      <h1 className="mt-15 mb-0 text-3xl font-semibold">
        {song.title}
      </h1>

      {song.melody && (
        <p className="opacity-60 mt-1">
          Melodi: {song.melody}
        </p>
      )}

      <pre className="mt-8 flex justify-center text-center whitespace-pre-wrap">
        {song.lyrics || 'Ingen sangtekst'}
      </pre>

      <p className="flex justify-center items-center pt-5 opacity-60">
        Skrevet av: {song.author || song.melody}
      </p>
    </main>
  );
}