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
  navigationPreload: true,
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

  if (event.request.mode !== 'navigate' || !isDynamicRoute || isRSC) return;

  event.respondWith(
    fetch(event.request)
      .then(async (response) => {
        // ← This is what was missing: manually populate the cache on success
        if (response.ok) {
          const cache = await caches.open('dynamic-pages');
          cache.put(event.request, response.clone());
        }
        return response;
      })
      .catch(async () => {
        const cache = await caches.open('dynamic-pages');

        const exact = await cache.match(event.request);
        if (exact) return exact;

        const prefix = url.pathname.startsWith('/songs/') ? '/songs/' : '/playlists/';
        const allCached = await cache.keys();

        const shellFallback = allCached.find((req) => {
          const reqUrl = new URL(req.url);
          return (
            reqUrl.pathname.startsWith(prefix) &&
            !req.headers.get('RSC') &&
            !reqUrl.searchParams.has('_rsc')
          );
        });

        if (shellFallback) {
          const shellResponse = await cache.match(shellFallback);
          if (shellResponse) return shellResponse;
        }

        return (await caches.match('/offline')) ?? Response.error();
      })
  );
});

serwist.addEventListeners();
