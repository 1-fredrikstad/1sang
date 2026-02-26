'use client';

import Link from 'next/link';
import { useSongs } from '@/src/hooks/useData';

export function HomePage() {
  const {
    data: songs,
    isLoading,
    error,
  } = useSongs({
    maxAgeMins: 5,
    syncOnMount: true,
  });

  if (error) return <div>Error: {error.message}</div>;
  if (!songs) return <div>Laster data...</div>;

  return (
    <main>
      <h1>Sanger</h1>

      {isLoading && <p>Synkroniserer med supabase...</p>}

      <ul>
        {songs.map((song) => (
          <li key={song.id}>
            <Link href={`/songs/${song.id}`} className="hover:cursor-pointer">
              {song.title ?? '(uten tittel)'}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
