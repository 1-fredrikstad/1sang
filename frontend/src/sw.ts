/// <reference lib="webworker" />

import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';
import { NetworkFirst, StaleWhileRevalidate } from 'serwist';
import { CacheableResponsePlugin, ExpirationPlugin } from 'serwist';

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
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
    // ← Remove the StaleWhileRevalidate block entirely, custom handler replaces it
    {
      matcher: ({ request }) => request.mode === 'navigate' || request.destination === 'document',
      handler: new NetworkFirst({
        cacheName: 'pages',
        networkTimeoutSeconds: 3,
        plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
      }),
    },
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
    ...defaultCache,
  ],

  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher({ request }) {
          return request.mode === 'navigate';
        },
      },
    ],
  },
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);
  const isRSC = event.request.headers.get('RSC') === '1' || url.searchParams.has('_rsc');

  const isDynamicRoute =
    (url.pathname.startsWith('/songs/') && url.pathname !== '/songs/') ||
    (url.pathname.startsWith('/playlists/') && url.pathname !== '/playlists/');

  if (!isDynamicRoute) return;

  const rscKey = url.pathname.startsWith('/songs/') ? '/songs/_shell' : '/playlists/_shell';

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(event.request);
        if (response.ok) {
          if (isRSC) {
            const cache = await caches.open('dynamic-rsc');
            cache.put(rscKey, response.clone());
          } else {
            const cache = await caches.open('dynamic-pages');
            cache.put(rscKey.replace('_shell', '_html'), response.clone());
          }
        }
        return response;
      } catch {
        if (isRSC) {
          const cache = await caches.open('dynamic-rsc');
          const cachedResponse = await cache.match(rscKey);
          if (cachedResponse) return cachedResponse;
        } else {
          const cache = await caches.open('dynamic-pages');
          const htmlKey = rscKey.replace('_shell', '_html');
          const cachedResponse = await cache.match(htmlKey);
          if (cachedResponse) return cachedResponse;
        }

        return (await caches.match('/offline')) ?? Response.error();
      }
    })()
  );
});

serwist.addEventListeners();
