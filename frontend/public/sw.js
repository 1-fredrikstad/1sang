const CACHE_NAME = 'app-cache-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches
        .keys()
        .then((keys) =>
          Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
        ),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests from our own origin
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Skip Next.js internal requests entirely — let them go through normally
  if (
    url.pathname.startsWith('/_next/') ||
    url.search.includes('_rsc=') ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // For page navigations — cache first, fall back to network
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached ?? new Response('Offline', { status: 503 }));

        return cached ?? fetchPromise;
      })
    )
  );
});
