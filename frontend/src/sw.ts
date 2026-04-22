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
      // Cache the HTML shell for dynamic song/playlist pages
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
      matcher: ({ request }) => request.mode === 'navigate' || request.destination === 'document',
      handler: new NetworkFirst({
        cacheName: 'pages',
        networkTimeoutSeconds: 3,
        runtimeCaching: [
          {
            matcher: ({ url }) =>
              url.pathname.startsWith('/songs/') || url.pathname.startsWith('/playlists/'),
            handler: new NetworkFirst({
              cacheName: 'dynamic-pages',
              networkTimeoutSeconds: 2,
              plugins: [
                new CacheableResponsePlugin({ statuses: [0, 200] }),
                new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }),
              ],
            }),
          },
          {
            matcher: ({ request }) => request.mode === 'navigate',
            handler: new NetworkFirst({
              cacheName: 'pages',
              networkTimeoutSeconds: 3,
              plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
            }),
          },
          ...defaultCache,
        ],
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

serwist.addEventListeners();
