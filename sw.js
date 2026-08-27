const CACHE = 'forma-v1';
const FILES = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});

// Push-bildirishnoma kelganda ko'rsatish
self.addEventListener('push', (event) => {
  let data = { title: 'Forma', body: 'Vaqti keldi!' };
  try { data = event.data.json(); } catch (e) {}

  const soundOn = true; // brauzer standart ovozini boshqaradi (silent:false)

  event.waitUntil(
    self.registration.showNotification(data.title || 'Forma', {
      body: data.body || '',
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [200, 100, 200],
      silent: false,
      tag: 'forma-schedule',
      renotify: true,
    })
  );
});

// Bildirishnoma bosilganda ilovani ochish
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./index.html');
    })
  );
});
