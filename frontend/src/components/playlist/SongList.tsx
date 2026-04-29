// SongList component
// Displays songs in tabs (all vs selected) with sorting and toggle support

import { Song } from '@/src/lib/db';
import { SongBox } from '../songs/SongBox';
import { Spinner } from '@/components/ui/spinner';
import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScoredSong } from '@/src/types/scoredSong';

export type PlaylistSongListProps = {
  songs: ScoredSong[];
  isLoading?: boolean;
  error?: Error | null;
  onToggleSong: (song: Song) => void;
  isAdded: (id: string) => boolean;
  defaultTab?: 'all' | 'selected';
};

export default function SongList({
  songs,
  isLoading,
  error,
  onToggleSong,
  isAdded,
  defaultTab = 'all',
}: PlaylistSongListProps) {
  // sort songs by score first, then alphabetically (Norwegian locale)
  const sortedSongs = useMemo(() => {
    return [...(songs ?? [])].sort((a, b) => {
      const scoreDiff = b.score - a.score;

      // higher score = higher priority
      if (scoreDiff !== 0) return scoreDiff;

      // fallback alphabetical sorting (handles æ, ø, å)
      return (a.song.title ?? '').trim().localeCompare((b.song.title ?? '').trim(), 'no', {
        sensitivity: 'base',
        numeric: true,
      });
    });
  }, [songs]);

  // error state
  if (error) return <div>Error: {error.message}</div>;

  // initial loading fallback
  if (!songs) return <Spinner message="Laster data" />;

  // split songs into selected and available
  const addedSongs = songs.filter((item) => isAdded(item.song.id));
  const availableSongs = sortedSongs.filter((item) => !isAdded(item.song.id));

  // reusable renderer for song list
  const renderList = (songs: ScoredSong[]) =>
    songs.map((item: ScoredSong) => (
      <li key={item.song.id} className="flex items-center gap-2">
        <button
          onClick={() => onToggleSong(item.song)}
          className="flex-1 hover:shadow-sm active:scale-[0.99] w-full transition cursor-pointer"
        >
          <SongBox
            song={item.song}
            mode="select"
            hoverVariant={isAdded(item.song.id) ? 'red' : 'green'}
          />
        </button>
      </li>
    ));

  return (
    <main>
      {/* loading indicator */}
      {isLoading && <Spinner message="Henter sanger" />}

      <Tabs defaultValue={defaultTab}>
        {/* tab navigation */}

        <div className="sticky top-0 z-10 bg-popover isolate">
          <TabsList className="mb-2">
            {/* all songs tab */}
            <TabsTrigger value="all" className="dark:border-none">
              Alle sanger ({availableSongs.length})
            </TabsTrigger>

            {/* selected songs tab */}
            <TabsTrigger value="selected" className="dark:border-none">
              Valgte sanger ({addedSongs.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* all songs list */}
        <TabsContent value="all">
          <ul className="flex flex-col gap-2 p-2">
            {availableSongs.length > 0 ? (
              renderList(availableSongs)
            ) : (
              <li className="text-sm opacity-60">Ingen sanger tilgjengelig</li>
            )}
          </ul>
        </TabsContent>

        {/* selected songs list */}
        <TabsContent value="selected">
          <ul className="flex flex-col gap-2 p-2">
            {addedSongs.length > 0 ? (
              renderList(addedSongs)
            ) : (
              <li className="text-sm opacity-60">Ingen valgte sanger</li>
            )}
          </ul>
        </TabsContent>
      </Tabs>
    </main>
  );
}
