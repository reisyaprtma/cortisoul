self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  console.log('Notifikasi diterima:', data);
  
  const title = data.title || 'Notifikasi Cortisoul';
  const options = {
    body: data.body || 'Anda mendapatkan pesan baru.',
    icon: 'https://cdn-icons-png.flaticon.com/512/3119/3119338.png',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // Bisa diarahkan ke URL tertentu jika di-klik
  // event.waitUntil(clients.openWindow('http://localhost:5173'));
});
