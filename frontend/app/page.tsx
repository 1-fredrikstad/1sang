// import ServiceWorkerRegister from "@/src/components/ServiceWorkerRegister";

// export default function Home() {
// 	return (
// 		<main>
// 			<h1>Test</h1>
// 			<ServiceWorkerRegister></ServiceWorkerRegister>
// 		</main>
// 	);
// }

'use client';

import './globals.css';
import { Suspense } from 'react';
import { useSongs } from '@/src/hooks/useData';

function SongDataDisplay() {
  const { data: songs, isLoading, error } = useSongs({
    maxAgeMins: 5,
    syncOnMount: true,
  });

  if (error) return <div>Error: {error.message}</div>;
  if (!songs) return <div>Laster data...</div>;

  return (
    <div>
      <div>
        {isLoading && <span>Synkroniserer med supabase...</span>}
      </div>
      <pre>{JSON.stringify(songs, null, 2)}</pre>
    </div>
  );
}

export default function Songs() {
  return (
    <Suspense fallback={<div>Henter sanger...</div>}>
      <SongDataDisplay />
    </Suspense>
  );
}
