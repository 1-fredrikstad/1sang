'use client';
import { useEffect } from 'react';

const PAGES_TO_CACHE = [
  '/',
  '/campfire',
  '/favorites',
  '/settings',
  '/make_playlist',
  '/playlists',
  '/add',
];

async function warmCache() {
  await Promise.allSettled(
    PAGES_TO_CACHE.flatMap((url) => [
      fetch(url, { priority: 'low' }),
      fetch(url, { headers: { RSC: '1', 'Next-Router-Prefetch': '1' }, priority: 'low' }),
    ])
  );
}

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        if (reg.active) {
          warmCache();
        } else {
          reg.addEventListener('activate', () => warmCache());
        }
      })
      .catch((err) => console.error('SW registration failed:', err));
  }, []);

  return null;
}
