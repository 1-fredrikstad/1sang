if (!self.define) {
  let e,
    s = {};
  const a = (a, c) => (
    (a = new URL(a + '.js', c).href),
    s[a] ||
      new Promise((s) => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = a), (e.onload = s), document.head.appendChild(e));
        } else ((e = a), importScripts(a), s());
      }).then(() => {
        let e = s[a];
        if (!e) throw new Error(`Module ${a} didn’t register its module`);
        return e;
      })
  );
  self.define = (c, i) => {
    const n = e || ('document' in self ? document.currentScript.src : '') || location.href;
    if (s[n]) return;
    let t = {};
    const r = (e) => a(e, n),
      f = { module: { uri: n }, exports: t, require: r };
    s[n] = Promise.all(c.map((e) => f[e] || r(e))).then((e) => (i(...e), t));
  };
}
define(['./workbox-0f7cba1c'], function (e) {
  'use strict';
  (importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '/DINOT/DINOT-Black.otf', revision: '703704c29727acd8539e21c1f519ee30' },
        { url: '/DINOT/DINOT-Bold.otf', revision: 'a067055eca9bfc8a4677d70c2eb93632' },
        { url: '/DINOT/DINOT-Light.otf', revision: '92782ccb175106c8a9d3694b304005d5' },
        { url: '/DINOT/DINOT-Medium.otf', revision: '7a02e60ab46a641ee4aff1203bb133b8' },
        { url: '/DINOT/DINOT-Regular.otf', revision: '4afbf8daaf912dae0b9a20e1fc1af809' },
        { url: '/DINOT/DINOTBlack.pdf', revision: '56cd3bb1a6d6ab50c0057f3bdbc397af' },
        { url: '/DINOT/DINOTBold.pdf', revision: '4b3169463a8224fff892ff1f3a2c1e9f' },
        { url: '/DINOT/DINOTLight.pdf', revision: '8b3f6b5edefa82ea15a3381e05d7f910' },
        { url: '/DINOT/DINOTMedium.pdf', revision: 'b9555ca3503f89bee392d49e2b7384bd' },
        { url: '/DINOT/DINOTRegular.pdf', revision: '9923d9195c455bc9931b813194b73daa' },
        {
          url: '/_next/static/B8FnahBWT_VV3o78ug7Zn/_buildManifest.js',
          revision: '9c4bfcc90e50a71271321750ef68c36e',
        },
        {
          url: '/_next/static/B8FnahBWT_VV3o78ug7Zn/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        { url: '/_next/static/chunks/010a5622-c6d3be6c45348798.js', revision: 'c6d3be6c45348798' },
        { url: '/_next/static/chunks/1009-ffac541591546b3d.js', revision: 'ffac541591546b3d' },
        { url: '/_next/static/chunks/1896-8c1de2fc9713501b.js', revision: '8c1de2fc9713501b' },
        { url: '/_next/static/chunks/2212-73a08d94ae9f8fda.js', revision: '73a08d94ae9f8fda' },
        { url: '/_next/static/chunks/2504-f1ee2f9abdf78bef.js', revision: 'f1ee2f9abdf78bef' },
        { url: '/_next/static/chunks/2922-5d06090acba03aae.js', revision: '5d06090acba03aae' },
        { url: '/_next/static/chunks/2955-dda649f4d30d1f65.js', revision: 'dda649f4d30d1f65' },
        { url: '/_next/static/chunks/3020-0a4432b19d5d0823.js', revision: '0a4432b19d5d0823' },
        { url: '/_next/static/chunks/3796-34235fbe3b95f688.js', revision: '34235fbe3b95f688' },
        { url: '/_next/static/chunks/3919-caed73a5771ebecc.js', revision: 'caed73a5771ebecc' },
        { url: '/_next/static/chunks/4144-179087bd60eb1b45.js', revision: '179087bd60eb1b45' },
        { url: '/_next/static/chunks/4236-2b32d1a664b25f0c.js', revision: '2b32d1a664b25f0c' },
        { url: '/_next/static/chunks/5404-8a4391c7033649df.js', revision: '8a4391c7033649df' },
        { url: '/_next/static/chunks/5610-c18f95672c770341.js', revision: 'c18f95672c770341' },
        { url: '/_next/static/chunks/5952-041502daf7a8bb2d.js', revision: '041502daf7a8bb2d' },
        { url: '/_next/static/chunks/5992-1586f99afe9a9e1d.js', revision: '1586f99afe9a9e1d' },
        { url: '/_next/static/chunks/6224-3a5ad5ddd5e768d7.js', revision: '3a5ad5ddd5e768d7' },
        { url: '/_next/static/chunks/6332-cc53dedbafa31a6e.js', revision: 'cc53dedbafa31a6e' },
        { url: '/_next/static/chunks/6562-5653d91cea1c0a95.js', revision: '5653d91cea1c0a95' },
        { url: '/_next/static/chunks/6713-acb22f5fddf79ad6.js', revision: 'acb22f5fddf79ad6' },
        { url: '/_next/static/chunks/6817-fe8ef6af5683d807.js', revision: 'fe8ef6af5683d807' },
        { url: '/_next/static/chunks/7409-d34cbf95acbbe6bb.js', revision: 'd34cbf95acbbe6bb' },
        { url: '/_next/static/chunks/7465-25dc97fa37531d82.js', revision: '25dc97fa37531d82' },
        { url: '/_next/static/chunks/8689-bb5cc0b63b30a000.js', revision: 'bb5cc0b63b30a000' },
        { url: '/_next/static/chunks/8916-c3c09bd025cc069d.js', revision: 'c3c09bd025cc069d' },
        { url: '/_next/static/chunks/9543-e76406438b7a6696.js', revision: 'e76406438b7a6696' },
        { url: '/_next/static/chunks/9891-3e8dfab474932ddc.js', revision: '3e8dfab474932ddc' },
        {
          url: '/_next/static/chunks/app/(main)/page-a1cc15cad654fc79.js',
          revision: 'a1cc15cad654fc79',
        },
        {
          url: '/_next/static/chunks/app/_global-error/page-b150280211e9502c.js',
          revision: 'b150280211e9502c',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-b150280211e9502c.js',
          revision: 'b150280211e9502c',
        },
        {
          url: '/_next/static/chunks/app/add/page-c92e6edc6ba41883.js',
          revision: 'c92e6edc6ba41883',
        },
        {
          url: '/_next/static/chunks/app/admin/(protected)/dashboard/page-19aa64ade1115a3f.js',
          revision: '19aa64ade1115a3f',
        },
        {
          url: '/_next/static/chunks/app/admin/(protected)/layout-f6b3d81f600a7e29.js',
          revision: 'f6b3d81f600a7e29',
        },
        {
          url: '/_next/static/chunks/app/admin/(protected)/suggestions/%5Bid%5D/edit/page-a21630b413f6a6ed.js',
          revision: 'a21630b413f6a6ed',
        },
        {
          url: '/_next/static/chunks/app/admin/(protected)/suggestions/%5Bid%5D/page-080621ae827ec2b4.js',
          revision: '080621ae827ec2b4',
        },
        {
          url: '/_next/static/chunks/app/admin/page-f5a48ea7a618057d.js',
          revision: 'f5a48ea7a618057d',
        },
        {
          url: '/_next/static/chunks/app/api/admin/users/role/route-b150280211e9502c.js',
          revision: 'b150280211e9502c',
        },
        {
          url: '/_next/static/chunks/app/api/admin/users/route-b150280211e9502c.js',
          revision: 'b150280211e9502c',
        },
        {
          url: '/_next/static/chunks/app/api/playlist_items/route-b150280211e9502c.js',
          revision: 'b150280211e9502c',
        },
        {
          url: '/_next/static/chunks/app/api/playlists/%5Bid%5D/route-b150280211e9502c.js',
          revision: 'b150280211e9502c',
        },
        {
          url: '/_next/static/chunks/app/api/playlists/%5Bid%5D/songs/route-b150280211e9502c.js',
          revision: 'b150280211e9502c',
        },
        {
          url: '/_next/static/chunks/app/api/playlists/route-b150280211e9502c.js',
          revision: 'b150280211e9502c',
        },
        {
          url: '/_next/static/chunks/app/api/playlists/verify/route-b150280211e9502c.js',
          revision: 'b150280211e9502c',
        },
        {
          url: '/_next/static/chunks/app/api/song_links/route-b150280211e9502c.js',
          revision: 'b150280211e9502c',
        },
        {
          url: '/_next/static/chunks/app/api/song_suggestions/route-b150280211e9502c.js',
          revision: 'b150280211e9502c',
        },
        {
          url: '/_next/static/chunks/app/api/song_tags/route-b150280211e9502c.js',
          revision: 'b150280211e9502c',
        },
        {
          url: '/_next/static/chunks/app/api/songs/%5Bid%5D/route-b150280211e9502c.js',
          revision: 'b150280211e9502c',
        },
        {
          url: '/_next/static/chunks/app/api/songs/route-b150280211e9502c.js',
          revision: 'b150280211e9502c',
        },
        {
          url: '/_next/static/chunks/app/api/tags/route-b150280211e9502c.js',
          revision: 'b150280211e9502c',
        },
        {
          url: '/_next/static/chunks/app/api/users/me/route-b150280211e9502c.js',
          revision: 'b150280211e9502c',
        },
        {
          url: '/_next/static/chunks/app/api/users/route-b150280211e9502c.js',
          revision: 'b150280211e9502c',
        },
        {
          url: '/_next/static/chunks/app/campfire/page-6efcb64996e4fd81.js',
          revision: '6efcb64996e4fd81',
        },
        {
          url: '/_next/static/chunks/app/favorites/page-2a2cb921f54049de.js',
          revision: '2a2cb921f54049de',
        },
        {
          url: '/_next/static/chunks/app/layout-dca214ddbdd8ca7b.js',
          revision: 'dca214ddbdd8ca7b',
        },
        {
          url: '/_next/static/chunks/app/make_playlist/page-47b923bd6c71a7d0.js',
          revision: '47b923bd6c71a7d0',
        },
        {
          url: '/_next/static/chunks/app/manifest.webmanifest/route-b150280211e9502c.js',
          revision: 'b150280211e9502c',
        },
        {
          url: '/_next/static/chunks/app/not-found-62580b72f9674496.js',
          revision: '62580b72f9674496',
        },
        {
          url: '/_next/static/chunks/app/playlists/%5Bid%5D/%5Bedit%5D/page-5a20995d59a7a309.js',
          revision: '5a20995d59a7a309',
        },
        {
          url: '/_next/static/chunks/app/playlists/%5Bid%5D/page-df3ee3af34313aba.js',
          revision: 'df3ee3af34313aba',
        },
        {
          url: '/_next/static/chunks/app/playlists/page-ca5643c93b67fc8f.js',
          revision: 'ca5643c93b67fc8f',
        },
        {
          url: '/_next/static/chunks/app/settings/page-76e9a8fcb7fc013f.js',
          revision: '76e9a8fcb7fc013f',
        },
        {
          url: '/_next/static/chunks/app/songs/%5Bslug%5D/edit/page-2c41c745b19220d7.js',
          revision: '2c41c745b19220d7',
        },
        {
          url: '/_next/static/chunks/app/songs/%5Bslug%5D/page-325c6db6b12e8773.js',
          revision: '325c6db6b12e8773',
        },
        { url: '/_next/static/chunks/f64e9218-7e9b9cf2c57f42e1.js', revision: '7e9b9cf2c57f42e1' },
        { url: '/_next/static/chunks/framework-a036e86c9c8e5729.js', revision: 'a036e86c9c8e5729' },
        { url: '/_next/static/chunks/main-3708103e10a3b2f1.js', revision: '3708103e10a3b2f1' },
        { url: '/_next/static/chunks/main-app-abc6890ee45c9c61.js', revision: 'abc6890ee45c9c61' },
        {
          url: '/_next/static/chunks/next/dist/client/components/builtin/app-error-b150280211e9502c.js',
          revision: 'b150280211e9502c',
        },
        {
          url: '/_next/static/chunks/next/dist/client/components/builtin/forbidden-b150280211e9502c.js',
          revision: 'b150280211e9502c',
        },
        {
          url: '/_next/static/chunks/next/dist/client/components/builtin/global-error-c877c21a9c378f0f.js',
          revision: 'c877c21a9c378f0f',
        },
        {
          url: '/_next/static/chunks/next/dist/client/components/builtin/unauthorized-b150280211e9502c.js',
          revision: 'b150280211e9502c',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        { url: '/_next/static/chunks/webpack-6162e08a695eaff6.js', revision: '6162e08a695eaff6' },
        { url: '/_next/static/css/8dfd8bfd35dcb5aa.css', revision: '8dfd8bfd35dcb5aa' },
        {
          url: '/_next/static/media/4cf2300e9c8272f7-s.p.woff2',
          revision: '18bae71b1e1b2bb25321090a3b563103',
        },
        {
          url: '/_next/static/media/747892c23ea88013-s.woff2',
          revision: 'a0761690ccf4441ace5cec893b82d4ab',
        },
        {
          url: '/_next/static/media/8d697b304b401681-s.woff2',
          revision: 'cc728f6c0adb04da0dfcb0fc436a8ae5',
        },
        {
          url: '/_next/static/media/93f479601ee12b01-s.p.woff2',
          revision: 'da83d5f06d825c5ae65b7cca706cb312',
        },
        {
          url: '/_next/static/media/9610d9e46709d722-s.woff2',
          revision: '7b7c0ef93df188a852344fc272fc096b',
        },
        {
          url: '/_next/static/media/ba015fad6dcf6784-s.woff2',
          revision: '8ea4f719af3312a055caf09f34c89a77',
        },
        { url: '/campfire/only_fire.svg', revision: 'e53fccb352f02d62fd00e136889bfb72' },
        {
          url: '/campfire/sounds/fire_crackling.mp3',
          revision: '6d5778eb047b01570467a581347781bb',
        },
        {
          url: '/campfire/sounds/fire_crackling_10.mp3',
          revision: 'efcae7a1f18b3c28534ad931f9bbe6ac',
        },
        {
          url: '/campfire/sounds/fire_crackling_5.mp3',
          revision: 'a16f2f7f09bb16b4b988dc01367c6f48',
        },
        {
          url: '/campfire/sounds/fire_crackling_75.mp3',
          revision: '86e4429c01c6b3326ed2ac7f3fa309cf',
        },
        { url: '/campfire/wood2.png', revision: '536f45d86a9be726f8bfdeda7aa9b826' },
        { url: '/favicon/apple-touch-icon.png', revision: '3d8676055196fd33f875c99228d23114' },
        { url: '/favicon/favicon-96x96.png', revision: '2268fa771cc1176d8c75cc7ec2cd0f3f' },
        { url: '/favicon/favicon.ico', revision: '8e3f6bc20d147978c40c53684d48cd03' },
        { url: '/favicon/favicon.svg', revision: '39b225490f136c803a0771c68261b660' },
        { url: '/favicon/site.webmanifest', revision: '01a372ea48ac69493b488b4a49ba6406' },
        {
          url: '/favicon/web-app-manifest-192x192.png',
          revision: '37973f43a4b09ddcf9ad0f71c415060f',
        },
        {
          url: '/favicon/web-app-manifest-512x512.png',
          revision: '349a484ab625c2e2be791378b5d8036b',
        },
        { url: '/file.svg', revision: 'd09f95206c3fa0bb9bd9fefabfd0ea71' },
        { url: '/globe.svg', revision: '2aaafa6a49b6563925fe440891e32717' },
        { url: '/google_logo.png', revision: '8d65b0abf33ef8aff96d5b90dff671db' },
        { url: '/window.svg', revision: 'a2760511c65806022ad20adf74370ff3' },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({ request: e, response: s, event: a, state: c }) =>
              s && 'opaqueredirect' === s.type
                ? new Response(s.body, { status: 200, statusText: 'OK', headers: s.headers })
                : s,
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const s = e.pathname;
        return !s.startsWith('/api/auth/') && !!s.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 })],
      }),
      'GET'
    ));
});
