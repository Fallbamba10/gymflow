const CACHE_NAME = "gymflow-v1";

// Ressources à mettre en cache immédiatement à l'installation
const PRECACHE_URLS = ["/", "/checkin", "/offline"];

// Installation — précache les pages clés
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

// Activation — supprime les anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — stratégie Network First pour les pages, Cache First pour les assets statiques
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET, API, et extensions de navigateur
  if (request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;
  if (!url.protocol.startsWith("http")) return;

  // Assets statiques (_next/static) → Cache First
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Pages HTML → Network First, fallback cache, fallback /offline
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached ?? caches.match("/offline"))
        )
    );
    return;
  }
});
