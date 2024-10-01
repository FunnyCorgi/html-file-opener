const CACHE_NAME = 'offline-cache-v3';
const URLS_TO_CACHE = [
    '/',            // Cache the root URL (index.html)
    '/index.html',  // Explicitly cache the main HTML page
    '/service-worker.js',  // Cache the service worker script itself
    'https://cdn.jsdelivr.net/npm/eruda',  // Cache Eruda from the CDN
];

// Install event: Cache all required files
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('Opened cache');
            return cache.addAll(URLS_TO_CACHE);
        }).catch(function(error) {
            console.error('Failed to cache during install', error);
        })
    );
    self.skipWaiting();  // Activate the new service worker immediately
});

// Activate event: Clean up old caches if necessary
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();  // Make the service worker take control immediately
});

// Fetch event: Serve cached files when offline
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            // If the file is found in the cache, return it
            if (response) {
                console.log('Serving from cache:', event.request.url);
                return response;
            }

            // Otherwise, fetch the request from the network
            return fetch(event.request).catch(function() {
                // If offline and the request isn't cached, return a fallback page or message
                return caches.match('/index.html');  // Fallback to index.html for offline users
            });
        })
    );
});
