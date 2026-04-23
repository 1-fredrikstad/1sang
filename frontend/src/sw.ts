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
  if (event.request.method !== 'GET') return;

  const isRSC =
    event.request.headers.get('RSC') === '1' ||
    url.searchParams.has('_rsc') ||
    event.request.headers.has('Next-Router-State-Tree');

  const isDynamicRoute =
    (url.pathname.startsWith('/songs/') && url.pathname !== '/songs/') ||
    (url.pathname.startsWith('/playlists/') && url.pathname !== '/playlists/');

  if (!isDynamicRoute) return;

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(event.request);
        if (response.ok) {
          const cache = await caches.open(isRSC ? 'dynamic-rsc' : 'dynamic-pages');
          // Cache by exact pathname — RSC payloads contain slug-specific
          // router state so they must be matched exactly
          cache.put(url.pathname, response.clone());
        }
        return response;
      } catch {
        const cache = await caches.open(isRSC ? 'dynamic-rsc' : 'dynamic-pages');
        // Try exact match first
        const cached = await cache.match(url.pathname);
        if (cached) return cached;

        // HTML navigation only: any shell of same type works since
        // useParams() reads from browser URL and data comes from IndexedDB
        if (!isRSC) {
          const prefix = url.pathname.startsWith('/songs/') ? '/songs/' : '/playlists/';
          const keys = await cache.keys();
          const fallback = keys.find((r) => new URL(r.url).pathname.startsWith(prefix));
          if (fallback) return (await cache.match(fallback)) ?? Response.error();
        }
        return (await caches.match('/offline')) ?? Response.error();
      }
    })()
  );
});

serwist.addEventListeners();
