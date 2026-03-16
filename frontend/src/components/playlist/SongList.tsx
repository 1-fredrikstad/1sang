import { Song } from '@/src/lib/db';
import { SongBox } from '../SongBox';
import { SongListProps } from '@/src/types/songList';

type ExtendedSongListProps = SongListProps & {
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

  return (
    <main className="mb-6">
      <h1 className="mb-4">Velg sanger:</h1>

      {isLoading && <p>Synkroniserer med supabase...</p>}

      <ul className="flex flex-col gap-2">
        {songs.map((song: Song) => (
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
        ))}
      </ul>
    </main>
  );
}
