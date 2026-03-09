'use client';

import { useParams } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Song } from '@/src/lib/db';
import BackButton from '@/src/components/BackButton';
import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';

export default function SongPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const song = useLiveQuery<Song | undefined>(() => (id ? db.songs.get(id) : undefined), [id]);

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
      {user && (
        <div className="absolute right-5 top-0">
          <Link href={`/songs/${id}/edit`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </Link>
        </div>
      )}

      <h1 className="mt-15 mb-0 text-3xl font-semibold">{song.title}</h1>

      {song.melody && <p className="opacity-60 mt-1">Melodi:{song.melody}</p>}

      <pre className="mt-8 flex justify-center text-center whitespace-pre-wrap">
        {song.lyrics || 'Ingen sangtekst'}
      </pre>

      {song.author && <p className="opacity-60 mt-1">Skrevet av: {song.author}</p>}
    </main>
  );
}
