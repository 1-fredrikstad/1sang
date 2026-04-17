'use client';

import { useParams, useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import SongForm from '@/src/components/songs/SongForm';
import { updateSuggestion } from '@/src/lib/actions/songSuggestions';
import { useMounted } from '@/src/hooks/useMounted';
import { toast } from 'sonner';
import BackButton from '@/src/components/BackButton';
import { Spinner } from '@/components/ui/spinner';

export default function EditSuggestionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const mounted = useMounted();

  const dexieSuggestion = useLiveQuery(() => {
    // Prevent Dexie query before client mount / SSR
    if (typeof window === 'undefined' || !mounted || !id) {
      return undefined;
    }
    return db.song_suggestions.get(id);
  }, [mounted, id]);

  const suggestion = dexieSuggestion ?? null;

  // Loading state while mounted/query resolves
  if (!mounted || dexieSuggestion === undefined) {
    return <Spinner message="Laster inn" />;
  }

  // Not found state
  if (!suggestion) {
    return <p className="text-center mt-12">Fant ikke forslaget</p>;
  }

  return (
    <main>
      <BackButton />

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
          spotify_youtube: suggestion.spotify_youtube ?? '',
          has_chords: suggestion.has_chords,
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
              spotify_youtube: suggestion.spotify_youtube || undefined,
              has_chords: suggestion.has_chords,
            });

            // Keep Dexie cache in sync immdiately after update
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
