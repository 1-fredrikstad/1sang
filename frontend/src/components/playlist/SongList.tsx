import { Song } from '@/src/lib/db';
import { SongBox } from '../songs/SongBox';
import { SongListProps } from '@/src/types/songList';

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
  if (error) return <div>Error: {error.message}</div>;
  if (!songs) return <div>Laster data...</div>;

  const addedSongs = songs.filter((song) => isAdded(song.id));
  const availableSongs = songs.filter((song) => !isAdded(song.id));

  // Function to show a list of songs
  const renderList = (songs: Song[]) =>
    songs.map((song: Song) => (
      <li key={song.id} className="flex items-stretch gap-2">
        <span className="flex-1">
          <SongBox song={song} />
        </span>
        <button
          type="button"
          onClick={() => onToggleSong(song)}
          className={`w-13 shrink-0 text-2xl relative rounded-sm outline-1 
                outline-[#0000001a] dark:shadow-xs dark:shadow-black hover:shadow-sm active:scale-[0.99] 
                transition cursor-pointer text-white ${isAdded(song.id) ? 'bg-red-300' : 'bg-green-300'}`}
        >
          {isAdded(song.id) ? '−' : '+'}
        </button>
      </li>
    ));

  return (
    <main className="mb-6">
      <h1>Velg sanger</h1>

      {isLoading && <p>Synkroniserer med supabase...</p>}

      {/* Added songs */}
      <section>
        <h2 className="text-sm mb-1">Valgte sanger:</h2>
        <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto border rounded p-2 mb-4">
          {addedSongs.length > 0 ? renderList(addedSongs) : <li>Ingen valgte sanger</li>}
        </ul>
      </section>

      {/* Available songs */}
      <section>
        <h2 className="text-sm mb-1">Alle sanger:</h2>
        <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto border rounded p-2">
          {renderList(availableSongs)}
        </ul>
      </section>
    </main>
  );
}
