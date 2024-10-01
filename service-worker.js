const CACHE_NAME = 'offline-cache-v1';
const URLS_TO_CACHE = [
    '/',
    '/index.html',  // Cache the main HTML page
    '/service-worker.js' // Cache the service worker script itself (optional)
];

// Install event: Cache the files
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('Opened cache');
            return cache.addAll(URLS_TO_CACHE);
        })
    );
});

// Fetch event: Serve files from the cache
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});

// Activate event: Remove old caches if needed
self.addEventListener('activate', function(event) {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
