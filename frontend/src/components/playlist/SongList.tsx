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
};

export default function SongList({
  songs,
  isLoading,
  error,
  onToggleSong,
  isAdded,
}: PlaylistSongListProps) {
  // Sort by score first, then alphabetical using Norwegian locale (handles æ, ø, å correctly)
  const sortedSongs = useMemo(() => {
    return [...(songs ?? [])].sort((a, b) => {
      const scoreDiff = b.score - a.score;

      // Higher score = higher priority
      if (scoreDiff !== 0) return scoreDiff;

      // Fallback: alphabetical sorting
      return (a.song.title ?? '').trim().localeCompare((b.song.title ?? '').trim(), 'no', {
        sensitivity: 'base',
        numeric: true,
      });
    });
  }, [songs]);

  if (error) return <div>Error: {error.message}</div>;
  if (!songs) return <Spinner message="Laster data" />;

  const addedSongs = songs.filter((item) => isAdded(item.song.id));
  const availableSongs = sortedSongs.filter((item) => !isAdded(item.song.id));

  // Function to show a list of songs
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
      {isLoading && <Spinner message="Synkroniserer med databasen" />}

      <Tabs defaultValue="all">
        {/* Tabs navigation */}
        <div className="sticky top-0 z-10 bg-popover isolate">
          <TabsList className="mb-2">
            <TabsTrigger value="all" className="dark:border-none">
              Alle sanger ({availableSongs.length})
            </TabsTrigger>

            <TabsTrigger value="selected" className="dark:border-none">
              Valgte sanger ({addedSongs.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* All songs tab */}
        <TabsContent value="all">
          <ul className="flex flex-col gap-2 p-2">
            {availableSongs.length > 0 ? (
              renderList(availableSongs)
            ) : (
              <li className="text-sm opacity-60">Ingen sanger tilgjengelig</li>
            )}
          </ul>
        </TabsContent>

        {/* Selected songs tab */}
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
