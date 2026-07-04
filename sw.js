// Service worker para Cuentas Streaming (PWA).
// Estrategia network-first: siempre intenta traer la versión más nueva; si no
// hay internet, sirve la última que guardó en caché. Solo cachea peticiones GET
// (las llamadas al servidor de Google Apps Script son POST y nunca se cachean,
// así que los datos siempre llegan en vivo).
const CACHE = 'cuentas-v2';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys()
    .then((nombres) => Promise.all(
      nombres.filter((n) => n !== CACHE).map((n) => caches.delete(n))
    ))
    .then(() => self.clients.claim())
));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        try {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        } catch (_) {}
        return res;
      })
      .catch(() => caches.match(req))
  );
});
