import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
});

// const nextConfig: NextConfig = {
//   outputFileTracingRoot: __dirname,

//   // turbopack: {
//   //   root: __dirname,
//   // },
//   reactStrictMode: true,
// };

export default withSerwist({});
