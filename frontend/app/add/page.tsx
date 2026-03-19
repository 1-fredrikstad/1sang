'use client';

import SongForm from '@/src/components/SongForm';
import { Suspense } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { createClient } from '@/src/lib/supabase/client';

export default function AddSongPage() {
  const { isAdmin, isLoading } = useAuth();
  const supabase = createClient();

  if (isLoading || isAdmin === null) {
    return <div>Henter skjema...</div>;
  }

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

          const body = await res.json().catch(() => null);

          if (!res.ok || body?.error) {
            throw new Error(body?.error ?? 'Kunne ikke legge til sang');
          }
        }}
      />
    </Suspense>
  );
}
