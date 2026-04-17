'use client';

import { useParams } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import BackButton from '@/src/components/BackButton';
import Link from 'next/link';
import { useMounted } from '@/src/hooks/useMounted';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Spinner } from '@/components/ui/spinner';
import { SuggestionActions } from '@/src/components/suggestions/SuggestionActions';
import Lyrics from '@/src/components/songs/Lyrics';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

export default function SuggestionPage() {
  const { id } = useParams<{ id: string }>();
  const mounted = useMounted();
  const [showChords, setShowChords] = useState(false);

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

  const hasChords =
    suggestion.verses?.some((v) => v.includes('[')) || suggestion.chorus?.includes('[');

  return (
    <main className="relative w-full text-center px-4">
      {/* Back */}
      <div className="absolute **:left-5 cursor-pointer">
        <BackButton />
      </div>

      {/* Edit button */}
      <div className="absolute right-5 top-0">
        <Link href={`/admin/suggestions/${id}/edit`} aria-label="Rediger forslag">
          <PencilSquareIcon
            className="h-6 w-6 text-foreground transition-all duration-200 opacity-70 hover:opacity-100"
            title="Rediger forslag"
          />
        </Link>
      </div>

      {/* Content */}
      <h1 className="mt-15 mb-0 text-3xl font-semibold">{suggestion.title}</h1>

      {suggestion.melody && <p className="opacity-60 mt-1">Melodi: {suggestion.melody}</p>}

      {hasChords && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <Switch checked={showChords} onCheckedChange={setShowChords} />
          <span className="text-sm opacity-60">Vis akkorder</span>
        </div>
      )}

      <pre className="mt-8 flex justify-center text-center whitespace-pre-wrap">
        <Lyrics chorus={suggestion.chorus} verses={suggestion.verses} showChords={showChords} />
      </pre>

      {suggestion.author && <p className="opacity-60 mt-1">Skrevet av: {suggestion.author}</p>}

      {/* Actions */}
      <section className="mt-12 flex justify-center">
        <SuggestionActions id={id} />
      </section>
    </main>
  );
}
