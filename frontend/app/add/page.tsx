'use client';

import SongForm from '@/src/components/songs/SongForm';
import { Suspense } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { createClient } from '@/src/lib/supabase/client';
import { syncService } from '@/src/lib/syncService';
import { useRouter } from 'next/navigation';
import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';
import CampfirePage from '../../src/components/campfire/CampfirePage';

export default function AddSongPage() {
  const { isAdmin } = useAuth();
  const supabase = createClient();
  const router = useRouter();
  const isOnline = useOnlineStatus();

  // Block song submission when offline (PWA constraint)
  if (!isOnline) {
    return <CampfirePage message="Du er offline. Koble til internett for å legge til sanger." />;
  }

  if (isAdmin === null) {
    return <div>Henter skjema...</div>;
  }

  // Admins publish songs directly; regular users submit suggestions
  const heading = isAdmin ? 'Publiser sang' : 'Send inn sangforslag';
  const submitLabel = isAdmin ? 'Publiser' : 'Send inn';
  const toastMessage = isAdmin ? 'Sang lagt inn' : 'Sangforslag sendt';

  return (
    <Suspense fallback={<div>Henter skjema...</div>}>
      <SongForm
        heading={heading}
        submitLabel={submitLabel}
        toastSuccessMessage={toastMessage}
        showTags={isAdmin}
        onSubmit={async (data) => {
          // Ensure tags are sent as a clean array (avoid undefined refs)
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

          // Attach session token for API authentication when available
          if (session?.access_token) {
            headers.Authorization = `Bearer ${session.access_token}`;
          }

          const res = await fetch('/api/songs', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
          });
          // Force refresh of related cached tables after mutation
          await syncService.syncTable('songs', { forceFresh: true });
          await syncService.syncTable('song_tags', { forceFresh: true });
          await syncService.syncTable('tags', { forceFresh: true });
          const body = await res.json().catch(() => null);

          if (!res.ok) {
            const errorMessage =
              typeof body?.error === 'string' ? body.error : (body?.error?.message ?? '');

            // Map Supabase constraint errors to user-friendly messages
            throw new Error(
              errorMessage.includes('songs_title_key') || errorMessage.includes('songs_slug_key')
                ? 'Det finnes allerede en sang med denne tittelen'
                : 'Kunne ikke legge til sangen'
            );
          }
          router.push('/');
        }}
      />
    </Suspense>
  );
}
