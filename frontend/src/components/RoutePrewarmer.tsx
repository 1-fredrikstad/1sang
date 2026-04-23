'use client';

import { useEffect } from 'react';

export default function RoutePrewarmer() {
  useEffect(() => {
    if (!navigator.serviceWorker || !navigator.onLine) return;

    const prewarm = async () => {
      const { db } = await import('@/src/lib/db');
      const [songs, playlists] = await Promise.all([db.songs.toArray(), db.playlists.toArray()]);

      const urls = [
        ...songs.map((s) => `/songs/${s.slug}`),
        ...playlists.map((p) => `/playlists/${p.id}`),
      ];

      for (const url of urls) {
        try {
          await fetch(url, { headers: { RSC: '1' } });
          await new Promise((r) => setTimeout(r, 100));
        } catch {
          // ignore
        }
      }
    };

    prewarm();
  }, []);

  return null;
}
