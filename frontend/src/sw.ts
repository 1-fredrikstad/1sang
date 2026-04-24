/// <reference lib="webworker" />

import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist, StaleWhileRevalidate, CacheFirst } from 'serwist';
import { CacheableResponsePlugin, ExpirationPlugin } from 'serwist';

// Extend the global scope to include the injected precache manifest
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Init Sewist service worker
const serwist = new Serwist({
  // Precache files injected at build time
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false, // Disable nav preload (we handle fetch manually)
  disableDevLogs: true,
  precacheOptions: {
    cleanupOutdatedCaches: true, // Remove old caches
    ignoreURLParametersMatching: [/.*/], // Ignore URL query params when matching precached assets
  },

  // Fallback behavior offline mode
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher({ request }) {
          // Apply fallback only to full page navs
          return request.destination === 'document';
        },
      },
    ],
  },

  runtimeCaching: [
    // 1. Apply shell pages (core routes)
    {
      matcher: ({ request, url }) => {
        const isDocument = request.destination === 'document';

        // Define routes that should behave like an app shell
        const isAppShellRoute =
          url.pathname === '/' ||
          url.pathname.startsWith('/songs') ||
          url.pathname.startsWith('/playlists');

        return isDocument && isAppShellRoute;
      },
      // Serve cached version first, update in background
      handler: new StaleWhileRevalidate({
        cacheName: 'app-html-shells',
        matchOptions: {
          ignoreSearch: true, // ignore query params
        },
        plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
      }),
    },

    // 2. Next.js static build assets (_next)
    {
      matcher: ({ url }) => url.pathname.startsWith('/_next/static/'),
      handler: new StaleWhileRevalidate({
        cacheName: 'next-static',
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          // Limit cache size and lifetime (30 days)
          new ExpirationPlugin({ maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 }),
        ],
      }),
    },
    // 3. Public assets
    {
      matcher: ({ url }) =>
        url.pathname.startsWith('/DINOT/') ||
        url.pathname.startsWith('/favicon/') ||
        url.pathname.startsWith('/campfire/') ||
        // Match common static file extensions
        url.pathname.match(/\.(otf|ttf|woff|woff2|svg|png|ico|mp3|jpg|jpeg|webp)$/) !== null,
      // Cache-first strategy  - fastest for static assets)
      handler: new CacheFirst({
        cacheName: 'public-assets',
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          // Assets lifetime up to one year
          new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 365 }),
        ],
      }),
    },
    ...defaultCache,
  ],
});

// self.addEventListener('fetch', (event: FetchEvent) => {
//   const url = new URL(event.request.url);
//   // Ignore cross-origin requests
//   if (url.origin !== self.location.origin) return;
//   // Ignore Next.js internals and API routes
//   if (url.pathname.startsWith('/_next/')) return;
//   if (url.pathname.startsWith('/api/')) return;
//   // Only handle GET requests
//   if (event.request.method !== 'GET') return;

//   // Detect RSC reqs (React Server Component)
//   const isRSC =
//     event.request.headers.get('RSC') === '1' ||
//     url.searchParams.has('_rsc') ||
//     event.request.headers.has('Next-Router-State-Tree');

//   // Dynamic routes
//   const isDynamicRoute =
//     (url.pathname.startsWith('/songs/') && url.pathname !== '/songs/') ||
//     (url.pathname.startsWith('/playlists/') && url.pathname !== '/playlists/');

//   if (!isDynamicRoute) return;

//   event.respondWith(
//     (async () => {
//       try {
//         // Try network first
//         const response = await fetch(event.request);
//         if (response.ok) {
//           // Store response in appropriate cache
//           const cache = await caches.open(isRSC ? 'dynamic-rsc' : 'dynamic-pages');
//           // Cache by exact pathname — RSC payloads contain slug-specific
//           // router state so they must be matched exactly
//           cache.put(url.pathname, response.clone());
//         }
//         return response;
//       } catch {
//         // Network failed -> fallback to cache
//         const cache = await caches.open(isRSC ? 'dynamic-rsc' : 'dynamic-pages');
//         // Try exact cached match first
//         const cached = await cache.match(url.pathname);
//         if (cached) return cached;

//         // For RSC, failing is acceptable, Next.js handles it
//         if (isRSC) return Response.error();

//         // If it's HTML, show the offline page
//         return (await caches.match('/offline')) ?? Response.error();
//       }
//     })()
//   );
// });

// Attach all Serwist-managed event listeners
serwist.addEventListeners();
