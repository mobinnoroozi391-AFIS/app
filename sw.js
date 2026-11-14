const CACHE = 'planner-v2';
const SHELL = ['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // صفحه‌ی اصلی: اول شبکه (برای به‌روزرسانی)، اگر نبود از حافظه
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); return res; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  // بقیه (آیکون‌ها، فونت): اول حافظه، بعد شبکه و ذخیره
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res && (res.status === 200 || res.type === 'opaque')) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return res;
  }).catch(() => hit)));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type: 'window'}).then(list => list.length ? list[0].focus() : clients.openWindow('./index.html')));
});
