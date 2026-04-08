'use client';

import { useParams, useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import SongForm from '@/src/components/songs/SongForm';
import { updateSuggestion } from '@/src/lib/actions/songSuggestions';
import { useMounted } from '@/src/hooks/useMounted';
import { toast } from 'react-toastify';
import BackButton from '@/src/components/BackButton';

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
    <main className="relative w-full max-w-300 mx-auto px-4 mt-15">
      <div className="absolute **:left-5 cursor-pointer">
        <BackButton />
      </div>

      <SongForm
        heading="Rediger forslag"
        submitLabel="Lagre endringer"
        toastSuccessMessage="Oppdatert"
        initialValues={{
          title: suggestion.title,
          melody: suggestion.melody ?? '',
          author: suggestion.author ?? '',
          chorus: suggestion.chorus ?? '',
          verses: suggestion.verses ?? '',
        }}
        onSubmit={async (data) => {
          const old = suggestion;

          try {
            await updateSuggestion(id, {
              title: data.title,
              melody: data.melody || undefined,
              author: data.author || undefined,
              chorus: data.chorus || undefined,
              verses: data.verses,
            });

            if (typeof window !== 'undefined' && db && old) {
              const updatedRow = { ...old, ...data };
              await db.song_suggestions.put(updatedRow);
              console.log('Dexie updated manually:', updatedRow.title);
            }

            toast('Forslag oppdatert!');
            router.push(`/admin/suggestions/${id}`);
            router.refresh();
          } catch (err: unknown) {
            console.error(err);
            const message = err instanceof Error ? err.message : 'Ukjent feil';
            toast(message || 'Noe gikk galt ved lagring');
          }
        }}
      />
    </main>
  );
}
