import { Song } from '@/src/lib/db';
import { SongBox } from '../SongBox';

export function PlaylistSongItem({ song, index }: { song: Song; index: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 text-right text-sm opacity-50 tabular-nums">{index + 1}</div>

      <div className="flex-1">
        <SongBox song={song} />
      </div>
    </div>
  );
}
