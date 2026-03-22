'use client';

import { useParams } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import BackButton from '@/src/components/BackButton';
import Link from 'next/link';
import { useMounted } from '@/src/hooks/useMounted';
import { EditIcon } from '@/src/components/icons/Icons';
import { Spinner } from '@/components/ui/spinner';
import { SuggestionActions } from '@/src/components/suggestions/SuggestionActions';

export default function SuggestionPage() {
  const { id } = useParams<{ id: string }>();
  const mounted = useMounted();

  const dexieSuggestion = useLiveQuery(() => {
    if (typeof window === 'undefined' || !mounted || !id) {
      return undefined;
    }
    return db.song_suggestions.get(id);
  }, [mounted, id]);

  const suggestion = dexieSuggestion ?? null;

  if (!mounted || dexieSuggestion === undefined) {
    return <Spinner message="Laster sangforslag" />;
  }

  if (dexieSuggestion === null || !suggestion) {
    return <Spinner message="Oppdaterer data" />;
  }

  return (
    <main className="relative w-full max-w-300 mx-auto text-center px-4">
      {/* Back */}
      <div className="absolute **:left-5 cursor-pointer">
        <BackButton />
      </div>

      {/* Edit button */}
      <div className="absolute right-5 top-0">
        <Link href={`/admin/suggestions/${id}/edit`} aria-label="Rediger forslag">
          <EditIcon
            className="h-6 w-6 text-foreground transition-all duration-200 opacity-70 hover:opacity-100"
            title="Rediger forslag"
          />
        </Link>
      </div>

      {/* Content */}
      <h1 className="mt-15 mb-0 text-3xl font-semibold">{suggestion.title}</h1>

      {suggestion.melody && <p className="opacity-60 mt-1">Melodi: {suggestion.melody}</p>}

      <pre className="mt-8 flex justify-center text-center whitespace-pre-wrap">
        {suggestion.lyrics}
      </pre>

      {suggestion.author && <p className="opacity-60 mt-1">Skrevet av: {suggestion.author}</p>}

      {/* Actions */}
      <section className="mt-12 flex justify-center">
        <SuggestionActions id={id} />
      </section>
    </main>
  );
}
