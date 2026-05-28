import { useRouter } from 'next/navigation';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useAuth } from '../context/AuthContext';

type SongOrPlaylistBoxProps = {
  onClose: () => void;
  songChoice: string;
};

export default function SongOrPlaylistBox({ onClose, songChoice }: SongOrPlaylistBoxProps) {
  const router = useRouter();
  const isOnline = useOnlineStatus();
  const { isAdmin } = useAuth();

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
        {/* Edit song suggestion drafts — only for non-admin users */}
        {!isAdmin && (
          <button
            className="cursor-pointer hover:bg-secondary w-full py-6"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              router.push('/add/drafts');
            }}
          >
            Mine sangforslag-utkast
          </button>
        )}
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
