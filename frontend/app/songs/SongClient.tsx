'use client';

import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import BackButton from '@/src/components/BackButton';
import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { FaSpotify, FaYoutube } from 'react-icons/fa';
import Lyrics from '@/src/components/songs/Lyrics';
import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { StarIcon } from '@/src/components/songs/StarIcon';
import { useSearchParams } from 'next/navigation';
import { usePlaylistDetails } from '@/src/hooks/usePlaylistDetails';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { useSwipeable } from 'react-swipeable';
import { Spinner } from '@/components/ui/spinner';
import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';
import NotFound from '../not-found';
import TagComponent from '@/src/components/TagComponent';

export default function SongClient() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug'); // Get slug from query instead of useParams()
  const playlistId = searchParams.get('playlistId');
  const isOnline = useOnlineStatus();

  // Check whether current user is admin
  const { isAdmin } = useAuth();
  const router = useRouter();

  // Toggle for showing/hiding chords in lyrics
  const [showChords, setShowChords] = useState(false);

  // Load song by slug from IndexedDB
  const song = useLiveQuery(async () => {
    if (!slug) return null;

    return await db.songs.where('slug').equals(slug).first();
  }, [slug]);

  // Load tags connected to the song through relation table
  const tags = useLiveQuery(async () => {
    if (!song?.id) return [];

    const relations = await db.song_tags.where('song_id').equals(song.id).toArray();

    const tagIds = relations.map((relation) => relation.tag_id);

    if (tagIds.length === 0) return [];

    return await db.tags.where('id').anyOf(tagIds).toArray();
  }, [song?.id]);

  // --- Navigation between songs in playlist ---
  const { songs: playlistSongs } = usePlaylistDetails(playlistId || '');
  const safePlaylistSongs = playlistSongs ?? [];

  const currentIndex = safePlaylistSongs.findIndex((s) => s.slug === song?.slug);

  const prevSong = currentIndex > 0 ? safePlaylistSongs[currentIndex - 1] : null;

  const nextSong =
    currentIndex >= 0 && currentIndex < safePlaylistSongs.length - 1
      ? safePlaylistSongs[currentIndex + 1]
      : null;

  // Enable swipe actions for next and prev navigation
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (nextSong) {
        router.push(`/songs?slug=${nextSong.slug}&playlistId=${playlistId}`);
      }
    },
    onSwipedRight: () => {
      if (prevSong) {
        router.push(`/songs?slug=${prevSong.slug}&playlistId=${playlistId}`);
      }
    },
    trackTouch: true,
    trackMouse: false,
    delta: 50,
  });

  // --- Loading logic ---
  // useLiveQuery returns undefined while it's querying
  const isQuerying = song === undefined;
  const [showBuffer, setShowBuffer] = useState(true);

  useEffect(() => {
    if (!isQuerying && song) {
      const timeout = setTimeout(() => setShowBuffer(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isQuerying, song]);

  if (isQuerying || showBuffer) {
    return (
      <main className="flex flex-col justify-center gap-4">
        <BackButton href="/" />
        <section className="flex flex-col items-center justify-center min-h-[50vh]">
          <Spinner message="Laster sang" />
        </section>
      </main>
    );
  }

  // If song can't be found
  if (!song) {
    if (!isOnline) {
      return (
        <main className="flex flex-col items-center justify-center min-h-[50vh]">
          <p className="opacity-60 text-sm">Denne sangen er ikke lagret offline ennå</p>
          <BackButton href="/" />
        </main>
      );
    }
    return <NotFound />;
  }

  // Detect platform from external song link
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
      // Invalid URL fallback
      return { name: 'Link' };
    }
    // Default fallback
    return { name: 'Link' };
  };

  // Platform display info for current song link
  const { name, icon: Icon, color } = getLinkPlatform(song.spotify_youtube || '');

  // Check whether song contains chord markers like [G], [Am], etc.
  const hasChords = song.verses?.some((v) => v.includes('[')) || song.chorus?.includes('[');

  return (
    <main {...handlers} className="flex flex-col justify-center gap-4 touch-pan-y">
      {/* Topbar */}
      <section className="flex flex-col gap-1">
        <div className="flex items-center gap-3 relative">
          <BackButton href="/" />
          <div className="absolute right-0 flex items-center gap-2">
            <StarIcon songId={song.id} />
            {isAdmin && isOnline && (
              <div>
                <Link href={`/songs/edit?slug=${slug}`}>
                  <PencilSquareIcon className="size-6 cursor-pointer" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="flex flex-col items-center justify-center">
        <h1 className="title-headline capitalize-first text-center flex-1">{song.title}</h1>

        {/* Header - song info */}
        <section className="flex flex-col items-center justify-center my-2">
          {/* Melody & link */}
          {song.melody && <p className="opacity-60">Melodi: {song.melody}</p>}
          {song.spotify_youtube && (
            <p className="opacity-60 mt-1 flex items-center gap-2">
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

          {/* Lyrics and chord toggle */}
          {hasChords && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-md opacity-60">Vis akkorder</span>

              <Switch
                checked={showChords}
                onCheckedChange={setShowChords}
                className="cursor-pointer"
              />
            </div>
          )}
        </section>

        {/* --- Song content --- */}

        {/* Lyrics and chorus */}
        <pre className="mt-3 flex justify-center text-center whitespace-pre-wrap">
          <Lyrics song={song} showChords={showChords} />{' '}
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
                  <TagComponent key={tag.id || tag.name} tag={tag} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Next and prev buttons */}
        {playlistId && (
          <div className="flex justify-center gap-20 mt-8">
            <button
              onClick={() => {
                if (prevSong) {
                  router.push(`/songs?slug=${prevSong.slug}&playlistId=${playlistId}`);
                }
              }}
              disabled={!prevSong}
              className="group flex flex-col items-center cursor-pointer text-sm opacity-70 hover:opacity-100 transition-all duration-200 disabled:opacity-30 disabled:cursor-default"
            >
              <ArrowLeftIcon className="h-6" />
              <span className="text-[14px] mt-1 transition-all duration-200 opacity-100 md:opacity-0 md:translate-y-1 md:group-hover:opacity-100 md:group-hover:translate-y-0">
                Forrige
              </span>
            </button>

            <button
              onClick={() => {
                if (nextSong) {
                  router.push(`/songs?slug=${nextSong.slug}&playlistId=${playlistId}`);
                }
              }}
              disabled={!nextSong}
              className="group flex flex-col items-center cursor-pointer text-sm opacity-70 hover:opacity-100 transition-all duration-200 disabled:opacity-30 disabled:cursor-default"
            >
              <ArrowRightIcon className="h-6" />
              <span className="text-[14px] mt-1 transition-all duration-200 opacity-100 md:opacity-0 md:translate-y-1 md:group-hover:opacity-100 md:group-hover:translate-y-0">
                Neste
              </span>
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
