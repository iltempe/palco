// Service Worker — cache app shell (network-first per i dati)
const CACHE_NAME = "eaw-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/config.js",
  "/js/storage.js",
  "/js/api.js",
  "/js/player.js",
  "/js/app.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Non intercettare Supabase, YouTube, ecc. — sempre dalla rete.
  if (url.origin !== self.location.origin) return;

  // App shell: cache-first con fallback rete.
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
