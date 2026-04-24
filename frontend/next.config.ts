import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

// Init Serwist service worker
const withSerwist = withSerwistInit({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: false, // Disable automatic navigation caching
  reloadOnOnline: false,
  disable: process.env.NODE_ENV === 'development',
  // Precache important routes and assets for offline use
  additionalPrecacheEntries: [
    { url: '/', revision: null },
    { url: '/add', revision: null },
    { url: '/campfire', revision: null },
    { url: '/campfire/only_fire.svg', revision: null },
    { url: '/campfire/wood2.png', revision: null },
    { url: '/favorites', revision: null },
    { url: '/make_playlist', revision: null },
    { url: '/offline', revision: null },
    { url: '/playlists', revision: null },
    { url: '/playlists/playlist', revision: null },
    { url: '/settings', revision: null },
    { url: '/songs', revision: null },
  ],
});

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  reactStrictMode: true,
};

// Wrap Next.js config with Serwist
export default withSerwist(nextConfig);
