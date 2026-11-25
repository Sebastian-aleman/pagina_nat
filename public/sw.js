// Service worker: permite funcionar sin conexión tras la primera carga.
// Estrategia stale-while-revalidate para archivos del mismo origen.
const CACHE = 'inventarium-v1'

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/', '/logo.svg'])).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== location.origin) return
  if (req.headers.has('range')) return // videos: sin caché (rangos)

  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: true })
      const network = fetch(req)
        .then((res) => {
          if (res.ok && res.status === 200) cache.put(req, res.clone())
          return res
        })
        .catch(() => cached ?? (req.mode === 'navigate' ? cache.match('/') : Response.error()))
      return cached ?? network
    }),
  )
})
