import { Song } from '@/src/lib/db';
import { SongBox } from '../songs/SongBox';
import { SongListProps } from '@/src/types/songList';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useMemo } from 'react';

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
        <Button
          type="button"
          onClick={() => onToggleSong(song)}
          className={`w-10 h-10 flex items-center justify-center text-2xl shrink-0 rounded-md outline-1 
                outline-[#0000001a] dark:shadow-xs dark:shadow-black hover:shadow-sm active:scale-[0.99] 
                transition cursor-pointer text-white ${isAdded(song.id) ? 'bg-red-400' : 'bg-[#58B030]'}`}
        >
          {isAdded(song.id) ? '-' : '+'}
        </Button>
        <span className="flex-1">
          <SongBox song={song} />
        </span>
      </li>
    ));

  return (
    <main className="mb-6">
      {isLoading && <Spinner message="Synkroniserer med databasen" />}

      {/* Added songs */}
      <section>
        <h2 className="text-sm mb-1">Valgte sanger:</h2>
        <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto p-2 mb-4">
          {addedSongs.length > 0 ? renderList(addedSongs) : <li>Ingen valgte sanger</li>}
        </ul>
      </section>

      {/* Available songs */}
      <section>
        <h2 className="text-sm mb-1">Alle sanger:</h2>
        <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto p-2">
          {renderList(availableSongs)}
        </ul>
      </section>
    </main>
  );
}
