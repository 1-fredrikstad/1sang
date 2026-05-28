'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import { useRouter } from 'next/navigation';
import BackButton from '@/src/components/BackButton';
import { TrashIcon } from '@heroicons/react/24/outline';

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Akkurat nå';
  if (minutes < 60) return `${minutes} min siden`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} t siden`;
  const days = Math.floor(hours / 24);
  return `${days} dag${days === 1 ? '' : 'er'} siden`;
}

export default function DraftsPage() {
  const router = useRouter();

  const drafts = useLiveQuery(
    () => db.suggestion_drafts.orderBy('updated_at').reverse().toArray(),
    []
  );

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await db.suggestion_drafts.delete(id);
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <BackButton href="/" />
      </div>

      <h1 className="text-2xl font-semibold mb-6">Mine sangforslag-utkast</h1>

      {drafts === undefined ? (
        <p className="text-sm opacity-60">Laster...</p>
      ) : drafts.length === 0 ? (
        <p className="text-sm opacity-60">Du har ingen lagrede utkast.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {drafts.map((draft) => (
            <li key={draft.id}>
              <div
                className="flex items-center justify-between p-4 rounded-lg border border-divider hover:bg-secondary cursor-pointer transition-colors"
                onClick={() => router.push(`/add?draft=${draft.id}`)}
              >
                <div>
                  <p className="font-medium">{draft.title || 'Uten tittel'}</p>
                  <p className="text-xs opacity-60 mt-0.5">
                    Sist redigert: {formatRelativeTime(draft.updated_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(e, draft.id)}
                  className="p-2 rounded-md hover:bg-background transition-colors opacity-60 hover:opacity-100 cursor-pointer"
                  aria-label="Slett utkast"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
