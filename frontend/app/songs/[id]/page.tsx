'use client';

import { useParams } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Song } from '@/src/lib/db';
import BackButton from '@/src/components/BackButton';
import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { FaSpotify, FaYoutube } from 'react-icons/fa';
import Lyrics from '@/src/components/songs/Lyrics';
import { Badge } from '@/components/ui/badge';

export default function SongPage() {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();

  const tags = useLiveQuery(async () => {
    if (!id) return [];
    const relations = await db.song_tags.where('song_id').equals(id).toArray();
    const tagIds = relations.map((relation) => relation.tag_id);

    return await db.tags.where('id').anyOf(tagIds).toArray();
  });

  const song = useLiveQuery<Song | undefined>(() => (id ? db.songs.get(id) : undefined), [id]);

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
    <main className="flex flex-col justify-center gap-4">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3 relative">
          <BackButton />
          <div className="absolute right-0">
            {isAdmin && (
              <div>
                <Link href={`/songs/${id}/edit`}>
                  <PencilSquareIcon className="size-6 cursor-pointer" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="flex flex-col items-center justify-center">
        <h1 className="title-headline capitalize-first">{song.title}</h1>

        {/* Song content */}

        {/* Melody & link */}
        {song.melody && <p className="opacity-60 mt-4">Melodi: {song.melody}</p>}
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

        {/* Lyrics */}
        <pre className="mt-5 flex justify-center text-center whitespace-pre-wrap">
          <Lyrics chorus={song.chorus} verses={song.verses} />
        </pre>

        {/* Author */}
        {song.author && <p className="opacity-60">Skrevet av: {song.author}</p>}

        {/* Tags */}
        <div className="text-center">
          {tags && tags.length > 0 && (
            <>
              <div className="flex flex-wrap justify-center gap-1 mt-5">
                <span className="opacity-60 leading-tight">Tags: </span>
                {tags.map((tag) => (
                  <Badge key={tag.id || tag.name} variant="secondary" className="p-2.5 mr-1">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
