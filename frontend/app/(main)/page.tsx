'use client';

import { Suspense } from 'react';
import ServiceWorkerRegister from '@/src/components/ServiceWorkerRegister';
import InstallPWABanner from '@/src/components/InstallPWABanner/InstallPWABanner';
import { useSongs } from '@/src/hooks/useData';
import { HomePage } from '../pages/HomePage';

function SongDataDisplay() {
  const { data: songs, error } = useSongs({
    maxAgeMins: 5,
    syncOnMount: true,
  });

  if (error) return <div>Error: {error.message}</div>;
  if (!songs) return <div>Laster data...</div>;

  return (
    <div>
      <HomePage />
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
