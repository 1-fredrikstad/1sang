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
    {
      // Dynamic song/playlist page shells
      matcher: ({ url }) =>
        url.pathname.startsWith('/songs/') || url.pathname.startsWith('/playlists/'),
      handler: new StaleWhileRevalidate({
        cacheName: 'dynamic-pages',
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }),
        ],
      }),
    },
    {
      // All other navigation
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

// After serwist is instantiated, before addEventListeners()

self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);

  const isDynamicRoute =
    (url.pathname.startsWith('/songs/') && url.pathname !== '/songs/') ||
    (url.pathname.startsWith('/playlists/') && url.pathname !== '/playlists/');

  if (event.request.mode !== 'navigate' || !isDynamicRoute) return;

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cache = await caches.open('dynamic-pages');

      // Try exact URL first
      const exact = await cache.match(event.request);
      if (exact) return exact;

      // Fall back to ANY cached shell for this route prefix
      // This works because all /songs/* pages have the same HTML shell
      const prefix = url.pathname.startsWith('/songs/') ? '/songs/' : '/playlists/';
      const allCached = await cache.keys();
      const shellFallback = allCached.find((req) => new URL(req.url).pathname.startsWith(prefix));

      if (shellFallback) {
        const shellResponse = await cache.match(shellFallback);
        if (shellResponse) return shellResponse;
      }

      // Last resort
      return (await caches.match('/offline')) ?? Response.error();
    })
  );
});

serwist.addEventListeners();
