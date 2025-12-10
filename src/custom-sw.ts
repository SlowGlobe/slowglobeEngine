/// <reference lib="webworker" />

declare let self: ServiceWorkerGlobalScope

// Precache manifest will be injected here
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
precacheAndRoute(self.__WB_MANIFEST)

cleanupOutdatedCaches()

self.addEventListener('push', (event) => {
  if (!event.data) return
  console.log('event info herewow:', event)

  const data = event.data.json()

  const pageUrl = self.location.href

  const options = {
    body: data.body,
    badge: pageUrl + '/favicon-96x96.png',
    icon: pageUrl + '/logoStamp.svg',
    image: data.imgUrl,
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data.url

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    })
  )
})
