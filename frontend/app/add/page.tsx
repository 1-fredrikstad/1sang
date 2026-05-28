'use client';

import SongForm from '@/src/components/songs/SongForm';
import { Suspense, useRef } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { createClient } from '@/src/lib/supabase/client';
import { syncService } from '@/src/lib/syncService';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';
import CampfirePage from '../../src/components/campfire/CampfirePage';
import { Spinner } from '@/components/ui/spinner';
import { db, type SuggestionDraft } from '@/src/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

function AddSongContent() {
  const { isAdmin } = useAuth();
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnline = useOnlineStatus();

  const draftId = searchParams.get('draft');
  // Tracks the current draft ID (may be set after first save of a new draft)
  const activeDraftId = useRef<string | null>(draftId);

  const draft = useLiveQuery(
    () => (draftId ? db.suggestion_drafts.get(draftId) : undefined),
    [draftId]
  );

  if (!isOnline) {
    return <CampfirePage message="Du er offline. Koble til internett for å legge til sanger." />;
  }

  if (isAdmin === null) {
    return <Spinner message="Henter skjema" />;
  }

  // While loading a draft from Dexie, wait
  if (draftId && draft === undefined) {
    return <Spinner message="Henter utkast" />;
  }

  const heading = isAdmin ? 'Publiser sang' : 'Send inn sangforslag';
  const submitLabel = isAdmin ? 'Publiser' : 'Send inn';
  const toastMessage = isAdmin ? 'Sang lagt inn' : 'Sangforslag sendt inn';

  const handleSaveDraft = async (data: Partial<SuggestionDraft>) => {
    const now = new Date().toISOString();
    const id = activeDraftId.current ?? (
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : uuidv4()
    );

    const draftData: SuggestionDraft = {
      id,
      title: (data.title as string) ?? '',
      author: (data.author as string) || undefined,
      melody: (data.melody as string) || undefined,
      chorus: (data.chorus as string) || undefined,
      verses: (data.verses as string[]) ?? [''],
      spotify_youtube: (data.spotify_youtube as string) || undefined,
      has_chords: (data.has_chords as boolean) ?? false,
      created_at: activeDraftId.current ? (draft?.created_at ?? now) : now,
      updated_at: now,
    };

    await db.suggestion_drafts.put(draftData);

    if (!activeDraftId.current) {
      activeDraftId.current = id;
      router.replace(`/add?draft=${id}`);
    }

    toast.success('Utkast lagret');
  };

  return (
    <SongForm
      heading={heading}
      submitLabel={submitLabel}
      toastSuccessMessage={toastMessage}
      showTags={isAdmin ?? false}
      initialValues={
        draft
          ? {
              title: draft.title,
              author: draft.author,
              melody: draft.melody,
              chorus: draft.chorus,
              verses: draft.verses,
              spotify_youtube: draft.spotify_youtube,
              has_chords: draft.has_chords,
            }
          : undefined
      }
      onSaveDraft={!isAdmin ? handleSaveDraft : undefined}
      onSubmit={async (data) => {
        const payload = {
          ...data,
          tags: [...(data.tags ?? [])],
        };

        const {
          data: { session },
        } = await supabase.auth.getSession();

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`;
        }

        const res = await fetch('/api/songs', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        await syncService.syncTable('songs', { forceFresh: true });
        await syncService.syncTable('song_tags', { forceFresh: true });
        await syncService.syncTable('tags', { forceFresh: true });
        const body = await res.json().catch(() => null);

        if (!res.ok) {
          const errorMessage =
            typeof body?.error === 'string' ? body.error : (body?.error?.message ?? '');

          throw new Error(
            errorMessage.includes('songs_title_key') || errorMessage.includes('songs_slug_key')
              ? 'Det finnes allerede en sang med denne tittelen'
              : 'Kunne ikke legge til sangen'
          );
        }

        // Delete local draft after successful submission
        if (activeDraftId.current) {
          await db.suggestion_drafts.delete(activeDraftId.current);
        }

        if (isAdmin && body?.data?.slug) {
          router.push(`/songs?slug=${body.data.slug}`);
        } else {
          toast.info('Forslaget er sendt inn og kan ikke lenger redigeres');
          router.push('/');
        }
      }}
    />
  );
}

export default function AddSongPage() {
  return (
    <Suspense fallback={<Spinner message="Henter skjema" />}>
      <AddSongContent />
    </Suspense>
  );
}
