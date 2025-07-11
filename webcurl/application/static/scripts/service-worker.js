const CACHE_NAME = "webcurl-cache-v1";
const urlsToCache = [
    "/", // Página principal
    "/static/styles/base.css",
    "/static/styles/sidebar.css",
    "/static/styles/editor.css",
    "/static/scripts/base.js",
    "/static/scripts/sidebar.js",
    "/static/scripts/query_manager.js",
    "/static/scripts/protocol.js",
    "/static/icons/favicon.ico"
];

// Instalar o Service Worker e adicionar ao cache
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                urlsToCache.map((url) =>
                    fetch(url)
                        .then((response) => {
                            if (!response.ok) {
                                console.warn(`Skipping caching of ${url}: ${response.statusText}`);
                                return null;
                            }
                            return cache.put(url, response);
                        })
                        .catch((err) => {
                            console.error(`Error fetching ${url}:`, err);
                            return null;
                        })
                )
            );
        })
    );
});

// Ativar o Service Worker e remover caches antigos
self.addEventListener("activate", (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptar requisições e retornar do cache
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
