import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sanger under liljen',
    short_name: '1sang',
    description: 'A PWA for Fredrikstad Scouts displaying their scout songs',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/favicon/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/favicon/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/favicon/favicon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/favicon/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
    ],
  };
}
