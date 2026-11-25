// Service worker: permite funcionar sin conexión tras la primera carga.
// - Página (HTML): primero la red, así siempre se carga la versión más nueva; sin internet, usa la copia guardada.
// - Archivos con hash (/assets/): copia guardada primero (nunca cambian).
// - Resto (modelos, medios): copia guardada y se actualiza en segundo plano.
const CACHE = 'inventarium-v3'

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/', '/logo.png'])).then(() => self.skipWaiting()))
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

  const isPage = req.mode === 'navigate' || url.pathname === '/'
  const isHashed = url.pathname.startsWith('/assets/')

  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(isPage ? '/' : req, { ignoreSearch: true })
      const fromNetwork = () =>
        fetch(req).then((res) => {
          if (res.ok && res.status === 200) cache.put(isPage ? '/' : req, res.clone())
          return res
        })

      if (isPage) return fromNetwork().catch(() => cached ?? Response.error())
      if (isHashed && cached) return cached
      const network = fromNetwork().catch(() => cached ?? Response.error())
      return cached ?? network
    }),
  )
})
