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

  // 1. ADD THIS: Restore your offline fallback page
  fallbacks: {
    entries: [
      {
        url: '/offline', // Ensure you have an app/offline/page.tsx
        matcher({ request }) {
          // If a user navigates to a totally uncached HTML page while offline, show this
          return request.destination === 'document';
        },
      },
    ],
  },

  runtimeCaching: [
    // 2. ADD THIS RULE BEFORE your other caches
    {
      // Match the exact path you use for songs (update this if you named the folder '/songs/view')
      matcher: ({ url }) => url.pathname.startsWith('/songs'),
      handler: new StaleWhileRevalidate({
        cacheName: 'song-page-shells',
        matchOptions: {
          // THIS IS THE MAGIC FIX:
          // It forces the SW to ignore the ?slug=abc and ?_rsc=123 part of the URL.
          // Now, all songs will seamlessly share the exact same cached Next.js shell!
          ignoreSearch: true,
        },
        plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
      }),
    },

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
    // Your public folder assets
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

        // DO NOT SERVE A DIFFERENT SONG'S HTML HERE.
        // If it's an RSC request, failing is fine (Next.js handles it).
        if (isRSC) return Response.error();

        // If it's HTML, show the offline page.
        return (await caches.match('/offline')) ?? Response.error();
      }
    })()
  );
});

serwist.addEventListeners();
