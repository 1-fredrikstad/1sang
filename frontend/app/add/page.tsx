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
          await db.songs.add({
            id: crypto.randomUUID(),
            title: data.title,
            melody: data.melody,
            author: data.author,
            lyrics: data.lyrics,
          });
        }}
      />
    </Suspense>
  );
}
