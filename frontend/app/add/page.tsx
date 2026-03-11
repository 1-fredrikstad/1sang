'use client';

import SongForm from '@/src/components/SongForm';
import { Suspense } from 'react';
import { useAuth } from '@/src/context/AuthContext';

export default function AddSongPage() {
  const { user } = useAuth();

  const heading = user ? 'Publiser sang' : 'Send inn sangforslag';
  const submitLabel = user ? 'Publiser' : 'Send inn';

  return (
    <Suspense fallback={<div>Henter skjema...</div>}>
      <SongForm
        heading={heading}
        submitLabel={submitLabel}
        toastSuccessMessage="Sang lagt inn"
        onSubmit={async (data) => {
          const endpoint = user ? '/api/songs' : '/api/song_suggestions';

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          const body = await res.json();

          if (!res.ok) {
            throw new Error(
              typeof body?.error === 'string' ? body.error : 'Kunne ikke legge til sang'
            );
          }
        }}
      />
    </Suspense>
  );
}
