import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  reloadOnOnline: false,
  disable: process.env.NODE_ENV === 'development',
  additionalPrecacheEntries: [
    { url: '/', revision: null },
    { url: '/campfire', revision: null },
    { url: '/favorites', revision: null },
    { url: '/settings', revision: null },
    { url: '/make_playlist', revision: null },
    { url: '/playlists', revision: null },
    { url: '/add', revision: null },
  ],
});

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  reactStrictMode: true,
  // Ensure all pages are included in the build
};

export default withSerwist(nextConfig);
