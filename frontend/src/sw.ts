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

  // Handle both navigation and RSC requests for dynamic routes
  event.respondWith(
    (async () => {
      try {
        // Try network first
        const response = await fetch(event.request);
        if (response.ok) {
          // Cache successful responses
          const cacheName = isRSC ? 'dynamic-rsc' : 'dynamic-pages';
          const cache = await caches.open(cacheName);
          if (isRSC) {
            // For RSC, cache by pathname only (ignore _rsc param)
            cache.put(url.pathname, response.clone());
          } else {
            // For navigation, cache the full request
            cache.put(event.request, response.clone());
          }
        }
        return response;
      } catch (error) {
        // Network failed, try cache
        const cacheName = isRSC ? 'dynamic-rsc' : 'dynamic-pages';
        const cache = await caches.open(cacheName);

        let cachedResponse;
        if (isRSC) {
          // For RSC, match by pathname
          cachedResponse = await cache.match(url.pathname);
        } else {
          // For navigation, try exact match first
          cachedResponse = await cache.match(event.request);
          if (!cachedResponse) {
            // Fallback to any cached page of the same type
            const prefix = url.pathname.startsWith('/songs/') ? '/songs/' : '/playlists/';
            const allCached = await cache.keys();
            const fallbackRequest = allCached.find((req) =>
              new URL(req.url).pathname.startsWith(prefix)
            );
            if (fallbackRequest) {
              cachedResponse = await cache.match(fallbackRequest);
            }
          }
        }

        if (cachedResponse) {
          return cachedResponse;
        }

        // Final fallback
        return (await caches.match('/offline')) ?? Response.error();
      }
    })()
  );
});

serwist.addEventListeners();
