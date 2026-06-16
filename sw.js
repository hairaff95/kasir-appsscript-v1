/**
 * Kasir Mini — Service Worker v3
 * Dynamic base path: works on localhost, IP, AND GitHub Pages subdirectory
 * Cache First untuk aset statis, Network First untuk API
 */

const CACHE_NAME = 'kasir-mini-v11';

// Deteksi base path secara dinamis dari lokasi sw.js
// Contoh: jika SW ada di /kasir-appsscript-v1/sw.js → BASE = /kasir-appsscript-v1/
//         jika SW ada di /sw.js                     → BASE = /
var BASE = self.location.pathname.replace(/\/sw\.js$/, '') + '/';
var OFFLINE_PAGE = BASE + 'offline.html';

var STATIC_ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'offline.html',
  BASE + 'manifest.json',
  BASE + 'css/app.css',
  BASE + 'js/utils.js',
  BASE + 'js/toast.js',
  BASE + 'js/api.js',
  BASE + 'js/app.js',
  BASE + 'js/pages/dashboard.js',
  BASE + 'js/pages/income.js',
  BASE + 'js/pages/expense.js',
  BASE + 'js/pages/debt.js',
  BASE + 'js/pages/history.js',
  BASE + 'js/pages/report.js',
  BASE + 'js/pages/account.js',
  BASE + 'js/pages/auth.js',
  BASE + 'js/pages/product.js',
  BASE + 'icons/icon-192.png',
  BASE + 'icons/icon-512.png',
];

// ---- Install: pre-cache semua aset statis ----
self.addEventListener('install', function(event) {
  console.log('[SW] Installing, BASE =', BASE);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[SW] Pre-caching static assets');
        // Cache satu per satu agar gagal satu tidak gagal semua
        return Promise.all(
          STATIC_ASSETS.map(function(url) {
            return cache.add(url).catch(function(err) {
              console.warn('[SW] Failed to cache:', url, err);
            });
          })
        );
      })
      .then(function() {
        console.log('[SW] Install complete, skipping waiting');
        return self.skipWaiting();
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
        console.log('[SW] Activated, claiming clients');
        return self.clients.claim();
      })
  );
});

// ---- Fetch: routing strategy ----
self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  // Skip non-GET
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension, devtools, etc.
  if (url.startsWith('chrome-extension://')) return;
  if (url.startsWith('devtools://')) return;

  // API Calls (Google Apps Script) → Network First, cache as fallback
  if (url.includes('script.google.com') || url.includes('script.googleusercontent.com')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Fonts & external CDNs → Stale While Revalidate
  if (
    url.includes('fonts.googleapis.com') ||
    url.includes('fonts.gstatic.com') ||
    url.includes('unpkg.com') ||
    url.includes('cdn.tailwindcss.com')
  ) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // Static assets → Cache First dengan fallback ke offline.html saat navigasi
  event.respondWith(cacheFirst(event.request));
});

// ---- Strategies ----

function cacheFirst(request) {
  return caches.match(request).then(function(cached) {
    if (cached) return cached;
    return fetchAndCache(request).catch(function() {
      // Jika navigasi dan offline, tampilkan halaman offline
      if (request.mode === 'navigate') {
        return caches.match(OFFLINE_PAGE).then(function(offlinePage) {
          return offlinePage || new Response(
            '<h1>Sedang Offline</h1><p>Buka kembali aplikasi saat ada koneksi internet.</p>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        });
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
        if (response && response.status === 200) {
          cache.put(request, response.clone());
        }
        return response;
      }).catch(function() { return cached; });
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
