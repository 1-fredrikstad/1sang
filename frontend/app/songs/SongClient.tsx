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
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
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

    const found = await db.songs.where('slug').equals(slug).first();
    return found ?? null;
  }, [slug]);

  // Load tags connected to the song through relation table
  const tags = useLiveQuery(async () => {
    if (!song?.id) return [];

    const relations = await db.song_tags.where('song_id').equals(song.id).toArray();

    const tagIds = relations.map((relation) => relation.tag_id);

    if (tagIds.length === 0) return [];

    return await db.tags.where('id').anyOf(tagIds).toArray();
  }, [song?.id]);

  // Navigation between songs in playlist
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

  // Loading state while song is fetched
  if (song === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen text-center">
        {navigator.onLine ? (
          <Spinner message="Laster sang"></Spinner>
        ) : (
          <p>Denne sangen er ikke lagret offline ennå</p>
        )}
      </div>
    );
  }

  // If song can't be fined
  if (song === null) {
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
      {/* Header */}
      <div className="flex flex-col gap-1">
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
      </div>

      <section className="flex flex-col items-center justify-center">
        <h1 className="title-headline capitalize-first text-center flex-1">{song.title}</h1>

        {/* Song content */}

        {/* Melody & link */}
        {song.melody && <p className="opacity-60 mt-4">Melodi: {song.melody}</p>}
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
            <Switch
              checked={showChords}
              onCheckedChange={setShowChords}
              className="cursor-pointer"
            />
            <span className="text-sm opacity-60">Vis akkorder</span>
          </div>
        )}

        {/* Lyrics */}
        <pre className="mt-5 flex justify-center text-center whitespace-pre-wrap">
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
          <div className="flex justify-center gap-10 mt-10">
            <button
              onClick={() => {
                if (prevSong) {
                  router.push(`/songs?slug=${prevSong.slug}&playlistId=${playlistId}`);
                }
              }}
              disabled={!prevSong}
              className="group flex flex-col items-center cursor-pointer text-sm opacity-70 hover:opacity-100 transition-all duration-200 disabled:opacity-30 disabled:cursor-default"
            >
              <ArrowLeftIcon className="h-5" />
              <span className="text-[12px] mt-1 opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
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
              <ArrowRightIcon className="h-5" />
              <span className="text-[12px] mt-1 opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
                Neste
              </span>
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
