'use client';

import SongForm from '@/src/components/SongForm';
import { Suspense } from 'react';

export default function AddSongPage() {
  return (
    <Suspense fallback={<div>Henter skjema...</div>}>
      <SongForm />
    </Suspense>
  );
}
