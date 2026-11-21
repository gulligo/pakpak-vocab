const C = 'jjigong-v3';
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== C; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.pathname.indexOf('/photo/') === 0 || url.pathname === '/tts') {
    e.respondWith(caches.open(C).then(function (c) {
      return c.match(req).then(function (hit) {
        return hit || fetch(new Request(req.url)).then(function (r) { if (r.ok) c.put(req, r.clone()); return r; });
      });
    }));
    return;
  }
  if (url.origin !== self.location.origin) return;
  e.respondWith(fetch(req).then(function (r) {
    var copy = r.clone();
    caches.open(C).then(function (c) { c.put(req, copy); });
    return r;
  }).catch(function () { return caches.match(req); }));
});
