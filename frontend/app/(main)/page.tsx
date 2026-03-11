'use client';

import { Suspense } from 'react';
import ServiceWorkerRegister from '@/src/components/ServiceWorkerRegister';
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

  return (
    <div>
      <HomePage songs={songs} isLoading={isLoading} error={error} />
    </div>
  );
}

export default function Page() {
  return (
    <>
      <ServiceWorkerRegister />
      <InstallPWABanner />
      <Suspense fallback={<div>Henter sanger...</div>}>
        <SongDataDisplay />
      </Suspense>
    </>
  );
}
