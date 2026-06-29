const CACHE_NAME = 'topscorers-v4'
const STATIC_ASSETS = [
  '/manifest.webmanifest',
  '/logo.png',
  '/logo-ball.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  let url
  try { url = new URL(req.url) } catch { return }

  // Only ever touch same-origin GET. Everything else → browser default.
  if (req.method !== 'GET' || url.origin !== self.location.origin) return

  // CRITICAL: never intercept Next.js App Router RSC navigations / data fetches.
  // A <Link> click fetches the RSC payload for the target URL with a normal
  // fetch (NOT mode:'navigate'); if the SW returned a cached HTML document for
  // that same URL, the router would receive HTML instead of RSC and the
  // client-side navigation would silently abort (the long-standing "sidebar
  // links do nothing" bug). Let these hit the network untouched.
  if (req.headers.get('RSC') === '1' || url.searchParams.has('_rsc')) return

  // Network-first for API + top-level navigations → always the freshest page
  // (avoids serving a stale pinned/bookmarked page), with an offline fallback.
  if (url.pathname.startsWith('/api/') || req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match(req)))
    return
  }

  // Cache-first + background revalidate ONLY for versioned static assets
  // (hashed JS/CSS from /_next/static and self-hosted media/fonts). Everything
  // else falls through to the network with no SW caching.
  const isStatic =
    url.pathname.startsWith('/_next/static/') ||
    /\.(css|js|mjs|png|jpg|jpeg|gif|svg|webp|avif|ico|woff2?|ttf)$/.test(url.pathname)
  if (!isStatic) return

  event.respondWith(
    caches.match(req).then(cached => {
      const networkFetch = fetch(req).then(response => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone))
        }
        return response
      })
      return cached || networkFetch
    })
  )
})
