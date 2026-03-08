'use client';

import SongForm from '@/src/components/SongForm';
import { Suspense } from 'react';
import { db } from '@/src/lib/db';

export default function AddSongPage() {
  return (
    <Suspense fallback={<div>Henter skjema...</div>}>
      <SongForm
        heading="Send inn forslag til sang"
        submitLabel="Send inn"
        toastSuccessMessage="Sang lagt inn"
        onSubmit={async (data) => {
          const res = await fetch('/api/song_suggestions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          const body = await res.json();

          if (!res.ok) {
            throw new Error(typeof body?.error === 'string' ? body.error : JSON.stringify(body));
          }
        }}
      />
    </Suspense>
  );
}
