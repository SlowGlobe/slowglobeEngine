/// <reference lib="webworker" />
//@ts-nocheck

// Precache manifest will be injected here
import { precacheAndRoute } from 'workbox-precaching'
precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('push', (event: any) => {
  if (!event.data) return

  const data = event.data.json()

  const options = {
    body: data.body,
    badge: '/favicon-96x96.png',
    icon: '/logoStamp.svg',
    image: data.imgUrl,
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener('notificationclick', (event: any) => {
  event.notification.close()

  const url = event.notification.data.url

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})
