
// Cache names
const CACHE_NAME = 'roadtracker-pro-v1';
const DATA_CACHE_NAME = 'roadtracker-pro-data-v1';

// Files to cache
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/assets/index.css',
  '/assets/index.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/assets/volvo-truck.png'
];

// Install service worker
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline page');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  
  self.clients.claim();
});

// Fetch event - cache strategy: network first, fallback to cache
self.addEventListener('fetch', (event) => {
  console.log('[ServiceWorker] Fetch', event.request.url);
  
  // Cache API requests separately
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }
            return response;
          })
          .catch((err) => {
            return cache.match(event.request);
          });
      })
    );
    return;
  }
  
  // For all other requests, use a cache-first strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
        .catch(() => {
          // If the main page fails to load, show the offline page
          if (event.request.mode === 'navigate') {
            return caches.open(CACHE_NAME)
              .then((cache) => cache.match('/offline.html'));
          }
        });
    })
  );
});

// Handle offline synchronization
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-time-entries') {
    // This would handle syncing time entries when back online
    // In a full implementation, this could sync with a backend
    console.log('[ServiceWorker] Syncing time entries');
  }
});
