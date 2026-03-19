'use client';

import { useParams, useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import SongForm from '@/src/components/SongForm';
import { updateSuggestion } from '@/src/lib/actions/songSuggestions';
import { useMounted } from '@/src/hooks/useMounted';

export default function EditSuggestionPage() {
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
    return <div className="flex justify-center items-center min-h-[60vh]">Laster...</div>;
  }

  if (!suggestion) {
    return <p className="text-center mt-12">Fant ikke forslaget</p>;
  }

  return (
    <SongForm
      heading="Rediger forslag"
      submitLabel="Lagre endringer"
      toastSuccessMessage="Oppdatert"
      initialValues={{
        title: suggestion.title,
        melody: suggestion.melody ?? '',
        author: suggestion.author ?? '',
        lyrics: suggestion.lyrics ?? '',
      }}
      onSubmit={async (data) => {
        const old = suggestion;
        // setSuggestion((prev) => (prev ? { ...prev, ...data } : null));

        try {
          await updateSuggestion(id, {
            title: data.title,
            melody: data.melody || undefined,
            author: data.author || undefined,
            lyrics: data.lyrics,
          });

          if (typeof window !== 'undefined' && db && old) {
            const updatedRow = { ...old, ...data };
            await db.song_suggestions.put(updatedRow);
            console.log('Dexie updated manually:', updatedRow.title);
          }

          alert('Forslag oppdatert!');
          router.push(`/admin/suggestions/${id}`);
          router.refresh();
        } catch (err: unknown) {
          console.error(err);
          const message = err instanceof Error ? err.message : 'Ukjent feil';
          alert(message || 'Noe gikk galt ved lagring');
          // setSuggestion(old);
        }
      }}
    />
  );
}
