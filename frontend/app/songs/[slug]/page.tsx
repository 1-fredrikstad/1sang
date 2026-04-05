'use client';

import { useParams } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Song } from '@/src/lib/db';
import BackButton from '@/src/components/BackButton';
import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';
import WakeLockToggle from '@/src/components/WakeLockToggle';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { FaSpotify, FaYoutube } from 'react-icons/fa';

export default function SongPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAdmin } = useAuth();

  const song = useLiveQuery<Song | undefined>(
    () => (slug ? db.songs.where('slug').equals(slug).first() : undefined),
    [slug]
  );

  const tags = useLiveQuery(async () => {
    if (!song?.id) return [];

    const relations = await db.song_tags.where('song_id').equals(song.id).toArray();

    const tagIds = relations.map((relation) => relation.tag_id);

    if (tagIds.length === 0) return [];

    return await db.tags.where('id').anyOf(tagIds).toArray();
  }, [song?.id]);

  if (!song) {
    return (
      <div className="flex justify-center items-center min-h-screen text-center">
        Laster sang...
      </div>
    );
  }

  const getLinkPlatform = (url: string) => {
    try {
      const hostname = new URL(url).hostname;

      if (hostname.includes('spotify.com')) {
        return { name: 'Spotify', icon: FaSpotify, color: 'text-green-500' };
      }
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        return { name: 'YouTube', icon: FaYoutube, color: 'text-red-500' };
      }
    } catch {
      return { name: 'Link' };
    }

    return { name: 'Link' };
  };

  const { name, icon: Icon, color } = getLinkPlatform(song.spotify_youtube || '');

  return (
    <>
      <div className="mx-auto w-full max-w-300 px-4 flex justify-between mt-4">
        <div className="cursor-pointer">
          <BackButton />
        </div>

        <WakeLockToggle />
      </div>

      <main className="relative w-full max-w-300 mx-auto text-center px-4">
        <div className="absolute left-5 top-1.5 cursor-pointer">
          <BackButton href={'/'} />
        </div>
        {isAdmin && (
          <div className="absolute right-5 top-0">
            <Link href={`/songs/${slug}/edit`}>
              <PencilSquareIcon className="size-6 cursor-pointer" />
            </Link>
          </div>
        )}

        <h1 className="mt-15 mb-0 text-3xl font-semibold">{song.title}</h1>

        <div className="opacity-60 mt-1">
          {tags && tags.length > 0 && <p>Tags: {tags.map((tag) => tag.name).join(', ')}</p>}
        </div>

        {song.melody && <p className="opacity-60 mt-1">Melodi: {song.melody}</p>}
        {song.spotify_youtube && (
          <p className="opacity-60 mt-1 flex flex-col items-center">
            <span>Link:</span>
            <a
              href={song.spotify_youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold hover:underline"
            >
              {Icon && <Icon className={`w-4 h-4 ${color}`} />}
              <span>{name}</span>
            </a>
          </p>
        )}
        <pre className="mt-8 flex justify-center text-center whitespace-pre-wrap">
          {song.lyrics || 'Ingen sangtekst'}
        </pre>
        {song.author && <p className="opacity-60 mt-1">Skrevet av: {song.author}</p>}
      </main>
    </>
  );
}
