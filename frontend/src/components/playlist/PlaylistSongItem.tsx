import { Song } from '@/src/lib/db';
import { SongBox } from '../songs/SongBox';

export function PlaylistSongItem({
  song,
  index,
  playlistId,
}: {
  song: Song;
  index: number;
  playlistId: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 text-right text-sm opacity-50 tabular-nums">{index + 1}</div>

      <div className="flex-1">
        <SongBox song={song} playlistId={playlistId} />
      </div>
    </div>
  );
}
