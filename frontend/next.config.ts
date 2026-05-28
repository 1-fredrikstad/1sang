import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';
import path from 'path';

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
    { url: '/favorites', revision: null },
    { url: '/make_playlist', revision: null },
    { url: '/offline', revision: null },
    { url: '/playlists', revision: null },
    { url: '/playlists/playlist', revision: null },
    { url: '/settings', revision: null },
    { url: '/songs', revision: null },
    // Fonts
    { url: '/DINOT/DINOT-Black.otf', revision: null },
    { url: '/DINOT/DINOT-Bold.otf', revision: null },
    { url: '/DINOT/DINOT-Light.otf', revision: null },
    { url: '/DINOT/DINOT-Medium.otf', revision: null },
    { url: '/DINOT/DINOT-Regular.otf', revision: null },
    { url: '/DINOT/DINOTBlack.pdf', revision: null },
    { url: '/DINOT/DINOTBold.pdf', revision: null },
    { url: '/DINOT/DINOTLight.pdf', revision: null },
    { url: '/DINOT/DINOTMedium.pdf', revision: null },
    { url: '/DINOT/DINOTRegular.pdf', revision: null },

    // Campfire assets
    { url: '/campfire/only_fire.svg', revision: null },
    { url: '/campfire/wood2.png', revision: null },
    { url: '/campfire/sounds/fire_crackling_75.mp3', revision: null },

    //Logo
    { url: '/favicon/favicon.svg', revision: null },
  ],
});

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../'),
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

// Wrap Next.js config with Serwist
export default withSerwist(nextConfig);
