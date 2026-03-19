'use client';

import { useParams, useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import BackButton from '@/src/components/BackButton';
import Link from 'next/link';
import { approveSuggestion, deleteSuggestion } from '@/src/lib/actions/songSuggestions';
import { useMounted } from '@/src/hooks/useMounted';
import { syncService } from '@/src/lib/syncService';

export default function SuggestionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const mounted = useMounted();

  const dexieSuggestion = useLiveQuery(() => {
    if (typeof window === 'undefined' || !mounted || !id) {
      return undefined;
    }
    return db.song_suggestions.get(id);
  }, [mounted, id]);

  const suggestion = dexieSuggestion ?? null;

  if (!mounted || dexieSuggestion === undefined) {
    console.log(dexieSuggestion);
    return <div className="flex justify-center items-center min-h-[60vh]">Laster forslag...</div>;
  }

  if (dexieSuggestion === null) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <p>Oppdaterer data fra serveren...</p>
        <p className="text-sm text-gray-500">(kan ta noen sekunder)</p>
      </div>
    );
  }

  if (!suggestion) {
    return <div className="flex justify-center items-center min-h-[60vh]">Oppdaterer data...</div>;
  }

  async function approve() {
    try {
      await approveSuggestion(id);
      if (typeof window !== 'undefined') {
        await db.song_suggestions.clear(); // removes the old cached row
      }

      setTimeout(() => router.push('/admin'), 300);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ukjent feil';
      alert(message || 'Kunne ikke godkjenne');
    }
  }

  async function reject() {
    try {
      await deleteSuggestion(id);

      if (typeof window !== 'undefined' && db) {
        await db.song_suggestions.delete(id);
      }
      setTimeout(() => router.push('/admin'), 300);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ukjent feil';
      alert(message || 'Kunne ikke avvise');
    }
  }

  return (
    <main className="relative w-full max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <div className="absolute left-5 cursor-pointer">
        <BackButton />
      </div>

      {/* Edit button */}
      <div className="absolute right-4 top-4">
        <Link
          href={`/admin/suggestions/${id}/edit`}
          title="Rediger forslag"
          className="text-gray-600 hover:text-gray-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
        </Link>
      </div>

      {/* Content */}
      <h1 className="mt-14 text-3xl font-bold">{suggestion.title}</h1>

      {suggestion.melody && <p className="mt-2 text-gray-600">Melodi: {suggestion.melody}</p>}

      <pre className="mt-8 whitespace-pre-wrap">{suggestion.lyrics}</pre>

      {suggestion.author && <p className="mt-2">Skrevet av: {suggestion.author}</p>}

      {/* Actions */}
      <div className="mt-12 flex justify-center gap-6">
        <button onClick={approve} className="bg-green-500 text-white px-4 py-2 rounded-lg">
          Godkjenn
        </button>

        <button onClick={reject} className="bg-red-500 text-white px-4 py-2 rounded-lg">
          Avvis
        </button>
      </div>
    </main>
  );
}
