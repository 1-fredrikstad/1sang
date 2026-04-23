/// <reference lib="webworker" />

import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist, StaleWhileRevalidate, CacheFirst } from 'serwist';
import { CacheableResponsePlugin, ExpirationPlugin } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  disableDevLogs: true,
  precacheOptions: {
    cleanupOutdatedCaches: true,
    ignoreURLParametersMatching: [/.*/],
  },
  runtimeCaching: [
    // Next.js static assets
    {
      matcher: ({ url }) => url.pathname.startsWith('/_next/static/'),
      handler: new StaleWhileRevalidate({
        cacheName: 'next-static',
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({ maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 }),
        ],
      }),
    },
    // Your public folder assets — fonts, icons, images, audio
    {
      matcher: ({ url }) =>
        url.pathname.startsWith('/DINOT/') ||
        url.pathname.startsWith('/favicon/') ||
        url.pathname.startsWith('/campfire/') ||
        url.pathname.match(/\.(otf|ttf|woff|woff2|svg|png|ico|mp3|jpg|jpeg|webp)$/) !== null,
      handler: new CacheFirst({
        cacheName: 'public-assets',
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 365 }),
        ],
      }),
    },
    ...defaultCache,
  ],
});

// Dynamic route shell caching (/songs/[slug], /playlists/[id])
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/_next/')) return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname === '/manifest.webmanifest') return;
  if (event.request.method !== 'GET') return;

  const isRSC =
    event.request.headers.get('RSC') === '1' ||
    url.searchParams.has('_rsc') ||
    event.request.headers.has('Next-Router-State-Tree');

  const isNavigate = event.request.mode === 'navigate';

  const isDynamicRoute =
    (url.pathname.startsWith('/songs/') && url.pathname !== '/songs/') ||
    (url.pathname.startsWith('/playlists/') && url.pathname !== '/playlists/');

  if (!isDynamicRoute) return;
  if (!isNavigate && !isRSC) return;

  event.respondWith(
    (async () => {
      const rscKey = url.pathname.startsWith('/songs/') ? '/songs/_shell' : '/playlists/_shell';
      const htmlKey = rscKey.replace('_shell', '_html');
      const cacheKey = isRSC ? rscKey : htmlKey;
      const cacheName = isRSC ? 'dynamic-rsc' : 'dynamic-pages';

      try {
        const response = await fetch(event.request);
        if (response.ok) {
          const cache = await caches.open(cacheName);
          cache.put(cacheKey, response.clone());
        }
        return response;
      } catch {
        const cache = await caches.open(cacheName);
        const cached = await cache.match(cacheKey);
        if (cached) return cached;
        // Last resort: serve precached shell
        return (await caches.match('/', { ignoreSearch: true })) ?? Response.error();
      }
    })()
  );
});

serwist.addEventListeners();
