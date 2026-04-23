/// <reference lib="webworker" />

import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist, StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'serwist';
import { CacheableResponsePlugin, ExpirationPlugin } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

function isRSCRequest(request: Request, url: URL): boolean {
  return (
    request.headers.get('RSC') === '1' ||
    url.searchParams.has('_rsc') ||
    request.headers.has('Next-Router-State-Tree')
  );
}

function isPageRequest(request: Request, url: URL): boolean {
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith('/_next/')) return false;
  if (url.pathname.startsWith('/api/')) return false;
  if (request.method !== 'GET') return false;
  return request.mode === 'navigate' || isRSCRequest(request, url);
}

function shellCacheKeyPlugin(shellPrefix: string) {
  return {
    cacheKeyWillBeUsed: async ({ request }: { request: Request }) => {
      const url = new URL(request.url);
      const suffix = isRSCRequest(request, url) ? '_rsc' : '_html';
      return `${url.origin}${shellPrefix}${suffix}`;
    },
  };
}

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
    {
      matcher: ({ request, url }) =>
        isPageRequest(request, url) && /^\/songs\/[^/]+$/.test(url.pathname),
      handler: new NetworkFirst({
        cacheName: 'song-shells',
        plugins: [
          shellCacheKeyPlugin('/songs/_shell'),
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 }),
        ],
      }),
    },
    {
      matcher: ({ request, url }) =>
        isPageRequest(request, url) && /^\/playlists\/[^/]+$/.test(url.pathname),
      handler: new NetworkFirst({
        cacheName: 'playlist-shells',
        plugins: [
          shellCacheKeyPlugin('/playlists/_shell'),
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 }),
        ],
      }),
    },
    {
      matcher: ({ request, url }) => isPageRequest(request, url),
      handler: new NetworkFirst({
        cacheName: 'pages',
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }),
        ],
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

serwist.addEventListeners();
