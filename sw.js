const CACHE = 'forma-v2';
const FILES = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Avval internetdan yangi faylni olishga harakat qilamiz (har doim eng yangi kod ishlatilsin).
// Internet bo'lmasa yoki xato bo'lsa, keshdagi (saqlangan) versiyani ko'rsatamiz.
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
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
