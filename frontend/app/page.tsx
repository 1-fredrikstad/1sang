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
import Link from "next/link";
import { createClient } from '../src/lib/supabase/server';
import { Suspense } from 'react';


async function SongData() {
  const supabase = await createClient();
  const { data: songs } = await supabase.from('songs').select();

    return (
    <ul>
      {songs?.map((song) => (
        <li key={song.id}>
          <Link href={`/songs/${song.id}`}>
            {song.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Songs() {
  return (
    <Suspense fallback={<div>Loading songs...</div>}>
      <SongData />
    </Suspense>
  );
}
