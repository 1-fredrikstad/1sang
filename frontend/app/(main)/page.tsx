import { Suspense } from 'react';
import ServiceWorkerRegister from '@/src/components/ServiceWorkerRegister';
import InstallPWABanner from '@/src/components/InstallPWABanner/InstallPWABanner';
import { SongDataDisplay } from '@/src/components/pages/SongDataDisplay';

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
