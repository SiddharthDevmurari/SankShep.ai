/*
 * Service worker for the installable app. It only caches the site's own files:
 * - pages: network first, so every deploy shows up at once; the last copy is used offline
 * - /assets/* (content-hashed by Vite): cache first, since a file there never changes
 * - icons and the manifest: served from cache, refreshed in the background
 * AI requests (/api/*), Supabase and every other site are never touched.
 */

const CACHE = 'sankshep-v1'
const SHELL = '/'

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add(SHELL)).catch(() => undefined))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return

  // Pages: the SPA serves index.html for every route, so one cached shell covers them all offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) caches.open(CACHE).then((cache) => cache.put(SHELL, res.clone()))
          return res
        })
        .catch(() => caches.match(SHELL).then((cached) => cached || Response.error())),
    )
    return
  }

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        if (res.ok) caches.open(CACHE).then((cache) => cache.put(request, res.clone()))
        return res
      })),
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fresh = fetch(request)
        .then((res) => {
          if (res.ok) caches.open(CACHE).then((cache) => cache.put(request, res.clone()))
          return res
        })
        .catch(() => cached)
      return cached || fresh
    }),
  )
})
