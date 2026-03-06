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
    <div>
      <h1 className="mb-5">Alle sanger</h1>

      {isLoading && <p>Synkronisesrer med supabase...</p>}

      <ul className="flex flex-col gap-2">
        {songs.map((song) => (
          <li
            key={song.id}
            className="rounded-sm outline-1 dark:bg-list-bg outline-[#0000001a] dark:shadow-xs dark:shadow-black hover:shadow-sm active:scale-[0.99] transition"
          >
            <Link href={`/songs/${song.id}`} className="block w-full py-4 pr-30 pl-4 text-left">
              {song.title ?? '(uten tittel)'}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
