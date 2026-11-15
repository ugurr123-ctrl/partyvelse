// PARTYVERSE Service Worker - Offline Shell & Asset Cache
const CACHE_NAME = 'partyverse-v1.2.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
];

const CACHEABLE_EXTERNAL_HOSTS = new Set([
  'lh3.googleusercontent.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
]);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip Colyseus WebSocket or /api calls from service worker cache
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/colyseus') || url.protocol === 'ws:' || url.protocol === 'wss:') {
    return;
  }

  // Network first for navigation (HTML), fallback to cached index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html').then((res) => res || caches.match('/') || Response.error());
      })
    );
    return;
  }

  // Cache first for static assets and allowlisted CDN images/fonts
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const isSameOriginOk = response && response.status === 200 && response.type === 'basic';
        const isAllowlistedExternal =
          CACHEABLE_EXTERNAL_HOSTS.has(url.hostname) &&
          response &&
          (response.status === 200 || response.type === 'opaque');
        if (!isSameOriginOk && !isAllowlistedExternal) {
          return response;
        }
        const toCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, toCache);
        });
        return response;
      }).catch(() => {
        return Response.error();
      });
    })
  );
});
