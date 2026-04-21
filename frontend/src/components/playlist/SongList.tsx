import { Song } from '@/src/lib/db';
import { SongBox } from '../songs/SongBox';
import { SongListProps } from '@/src/types/songList';
import { Spinner } from '@/components/ui/spinner';
import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type ExtendedSongListProps = SongListProps & {
  onToggleSong: (song: Song) => void;
  isAdded: (id: string) => boolean;
};

export default function SongList({
  songs,
  isLoading,
  error,
  onToggleSong,
  isAdded,
}: ExtendedSongListProps) {
  // Sort using Norwegian locale (handles æ, ø, å correctly)
  const sortedSongs = useMemo(() => {
    return [...(songs ?? [])].sort((a, b) =>
      (a.title ?? '').trim().localeCompare((b.title ?? '').trim(), 'no', { sensitivity: 'base' })
    );
  }, [songs]);

  if (error) return <div>Error: {error.message}</div>;
  if (!songs) return <div>Laster data...</div>;

  const addedSongs = songs.filter((song) => isAdded(song.id));
  const availableSongs = sortedSongs.filter((song) => !isAdded(song.id));

  // Function to show a list of songs
  const renderList = (songs: Song[]) =>
    songs.map((song: Song) => (
      <li key={song.id} className="flex items-center gap-2">
        <button
          onClick={() => onToggleSong(song)}
          className="flex-1 hover:shadow-sm active:scale-[0.99] w-full transition cursor-pointer"
        >
          <SongBox song={song} mode="select" hoverVariant={isAdded(song.id) ? 'red' : 'green'} />
        </button>
      </li>
    ));

  return (
    <main>
      {isLoading && <Spinner message="Synkroniserer med databasen" />}

      <Tabs defaultValue="all">
        {/* Tabs header */}
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

        <TabsContent value="all">
          <ul className="flex flex-col gap-2 p-2">
            {availableSongs.length > 0 ? (
              renderList(availableSongs)
            ) : (
              <li className="text-sm opacity-60">Ingen sanger tilgjengelig</li>
            )}
          </ul>
        </TabsContent>

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
