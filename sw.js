/**
 * Kasir Mini — Service Worker v2
 * Cache First untuk aset statis, Network First untuk API
 */

const CACHE_NAME    = 'kasir-mini-v10';
const OFFLINE_PAGE  = '/offline.html';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/css/app.css',
  '/js/utils.js',
  '/js/toast.js',
  '/js/api.js',
  '/js/app.js',
  '/js/pages/dashboard.js',
  '/js/pages/income.js',
  '/js/pages/expense.js',
  '/js/pages/debt.js',
  '/js/pages/history.js',
  '/js/pages/report.js',
  '/js/pages/account.js',
  '/js/pages/auth.js',
  '/js/pages/product.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ---- Install: pre-cache semua aset statis ----
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[SW] Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS).catch(function(err) {
          console.warn('[SW] Some assets failed to pre-cache:', err);
        });
      })
      .then(function() {
        return self.skipWaiting(); // Aktifkan SW baru segera
      })
  );
});

// ---- Activate: hapus cache lama ----
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames
            .filter(function(name) { return name !== CACHE_NAME; })
            .map(function(name) {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(function() {
        return self.clients.claim(); // Ambil alih semua tab
      })
  );
});

// ---- Fetch: routing strategy ----
self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  // Skip non-GET
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension
  if (url.startsWith('chrome-extension://')) return;

  // API Calls (Google Apps Script) → Network First, cache as fallback
  if (url.includes('script.google.com') || url.includes('script.googleusercontent.com')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Fonts & external CDNs → Stale While Revalidate
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com') || url.includes('cdn.tailwindcss.com')) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // Static assets → Cache First
  event.respondWith(cacheFirst(event.request));
});

// ---- Strategies ----

function cacheFirst(request) {
  return caches.match(request).then(function(cached) {
    if (cached) return cached;
    return fetchAndCache(request).catch(function() {
      if (request.mode === 'navigate') {
        return caches.match(OFFLINE_PAGE);
      }
    });
  });
}

function networkFirst(request) {
  return fetch(request, { redirect: 'follow' })
    .then(function(response) {
      if (response && response.status === 200) {
        var toCache = response.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(request, toCache); });
      }
      return response;
    })
    .catch(function() {
      return caches.match(request).then(function(cached) {
        return cached || new Response(
          JSON.stringify({ success: false, error: 'Tidak ada koneksi. Data mungkin belum terbaru.' }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      });
    });
}

function staleWhileRevalidate(request) {
  return caches.open(CACHE_NAME).then(function(cache) {
    return cache.match(request).then(function(cached) {
      var fetchPromise = fetch(request).then(function(response) {
        cache.put(request, response.clone());
        return response;
      }).catch(function() {});
      return cached || fetchPromise;
    });
  });
}

function fetchAndCache(request) {
  return fetch(request).then(function(response) {
    if (response && response.status === 200 && response.type !== 'opaque') {
      var toCache = response.clone();
      caches.open(CACHE_NAME).then(function(cache) { cache.put(request, toCache); });
    }
    return response;
  });
}
