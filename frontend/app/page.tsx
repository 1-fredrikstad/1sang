// import ServiceWorkerRegister from "@/src/components/ServiceWorkerRegister";

// export default function Home() {
// 	return (
// 		<main>
// 			<h1>Test</h1>
// 			<ServiceWorkerRegister></ServiceWorkerRegister>
// 		</main>
// 	);
// }

import './globals.css';
import { createClient } from '../src/lib/supabase/server';
import { Suspense } from 'react';
import InstallPWABanner from '@/src/components/InstallPWABanner/InstallPWABanner';
import ServiceWorkerRegister from '@/src/components/ServiceWorkerRegister';

async function SongData() {
  const supabase = await createClient();
  const { data: songs } = await supabase.from('songs').select();

  return <pre>{JSON.stringify(songs, null, 2)}</pre>;
}

export default function Songs() {
  return (
    <>
      <InstallPWABanner />
      <ServiceWorkerRegister />

      <Suspense fallback={<div>Loading songs...</div>}>
        <SongData />
      </Suspense>
    </>
  );
}
