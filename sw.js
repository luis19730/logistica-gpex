/* Service worker - GPEX / Gestão de Riscos - E/4
 * Estratégia: network-first para mesma origem, com fallback ao cache (uso offline).
 * Atualização segura: quando online, sempre busca a versão mais recente e atualiza o cache.
 */
const CACHE = 'gpex-e4-v1';
const APP_SHELL = [
  './',
  './index.html',
  './css/gpex.css',
  './vendor/mermaid.min.js',
  './js/gpex-dados.js',
  './js/gpex-app.js',
  './img/logo.png',
  './manifest.webmanifest'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(APP_SHELL).catch(function () { /* ignora falhas individuais */ });
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        return hit || caches.match('./index.html');
      });
    })
  );
});
