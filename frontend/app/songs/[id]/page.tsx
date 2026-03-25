'use client';

import { useParams } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Song } from '@/src/lib/db';
import BackButton from '@/src/components/BackButton';
import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';
import WakeLockToggle from '@/src/components/WakeLockToggle';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

export default function SongPage() {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();

  const song = useLiveQuery<Song | undefined>(() => (id ? db.songs.get(id) : undefined), [id]);

  if (!song) {
    return (
      <div className="flex justify-center items-center min-h-screen text-center">
        Laster sang...
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-300 px-4 flex justify-end mt-4">
        <WakeLockToggle />
      </div>

      <main className="relative w-full max-w-300 mx-auto text-center px-4">
        <div className="absolute left-5 top-1.5 cursor-pointer">
          <BackButton />
        </div>
        {isAdmin && (
          <div className="absolute right-5 top-0">
            <Link href={`/songs/${id}/edit`}>
              <PencilSquareIcon className="size-6 cursor-pointer" />
            </Link>
          </div>
        )}

        <h1 className="mt-15 mb-0 text-3xl font-semibold">{song.title}</h1>

        {song.melody && <p className="opacity-60 mt-1">Melodi: {song.melody}</p>}

        <pre className="mt-8 flex justify-center text-center whitespace-pre-wrap">
          {song.lyrics || 'Ingen sangtekst'}
        </pre>

        {song.author && <p className="opacity-60 mt-1">Skrevet av: {song.author}</p>}
      </main>
    </>
  );
}
