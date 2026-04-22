'use client';

import { Suspense } from 'react';
import InstallPWABanner from '@/src/components/InstallPWABanner/InstallPWABanner';
import { useSongs } from '@/src/hooks/useData';
import { HomePage } from '../../src/components/pages/HomePage';

function SongDataDisplay() {
  const {
    data: songs,
    isLoading,
    error,
  } = useSongs({
    maxAgeMins: 5,
    syncOnMount: true,
  });

  return <HomePage songs={songs} isLoading={isLoading} error={error} />;
}

export default function Page() {
  return (
    <>
      <InstallPWABanner />
      <Suspense fallback={<div>Henter sanger...</div>}>
        <SongDataDisplay />
      </Suspense>
    </>
  );
}
