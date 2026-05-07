import { useRouter } from 'next/navigation';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

type SongOrPlaylistBoxProps = {
  onClose: () => void;
  songChoice: string;
};

// Component for an admin to choose between adding a new song or creating a new playlist
export default function SongOrPlaylistBox({ onClose, songChoice }: SongOrPlaylistBoxProps) {
  const router = useRouter();
  const isOnline = useOnlineStatus();

  return (
    <section
      className="fixed top-0 left-0 right-0 bottom-14 z-100 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <article className="bg-background rounded-t-xl shadow-lg shadow-shadow w-full max-w-md flex flex-col divide-y divide-divider">
        {/* Add new song button */}
        <button
          className={`cursor-pointer w-full py-6 rounded-t-xl transition-opacity ${
            isOnline ? 'hover:bg-secondary' : 'opacity-40 cursor-not-allowed'
          }`}
          disabled={!isOnline}
          title={!isOnline ? 'Ikke tilgjengelig offline' : undefined}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
            router.push('/add');
          }}
        >
          {songChoice}
          {!isOnline && <span className="block text-xs opacity-60">Ikke tilgjengelig offline</span>}
        </button>
        {/* Create new playlist button */}
        <button
          className="cursor-pointer hover:bg-secondary w-full py-6"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
            router.push('/make_playlist');
          }}
        >
          Lag ny spilleliste
        </button>
      </article>
    </section>
  );
}
