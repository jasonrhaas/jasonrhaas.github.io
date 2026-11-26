
const C = 'shop-db0038b5608a';
const FILES = ['./', './index.html', './manifest.webmanifest', './shop-icon-180.png', './shop-icon-192.png', './shop-icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  const net = fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return r; });
  const late = new Promise(res => setTimeout(res, 3000)).then(() => caches.match(e.request, {ignoreSearch: true}));
  e.respondWith(Promise.race([net.catch(() => null), late])
    .then(r => r || caches.match(e.request, {ignoreSearch: true}))
    .then(r => r || net)
    .catch(() => caches.match('./index.html')));
});
