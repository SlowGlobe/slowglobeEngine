const notificationApiUrl = 'https://slow-notification-service.dlbs.workers.dev'

export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  try {
    const permission = await requestNotificationPermission()
    if (permission !== 'granted') {
      console.error('Notification permission not granted')
      return null
    }

    const registration = await navigator.serviceWorker.ready
    console.log('registration:', registration)

    // Get the server's public key
    // You need to fetch this from your backend
    const response = await fetch(notificationApiUrl + '/api/vapid-public-key')
    const vapidPublicKey = await response.text()

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    })

    //generate a unique id for the subscription
    const id = crypto.randomUUID()
    // Store the subscription id to localStorage
    localStorage.setItem('subscriptionId', id)

    // Send the subscription to your server
    const status = await fetch(notificationApiUrl + '/api/subscribe/' + id, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    })
    if (status.status !== 200) {
      console.error('Failed to subscribe:', status.statusText)
      registration.pushManager.getSubscription().then((sub) => {
        sub?.unsubscribe()
      })
      localStorage.removeItem('subscriptionId')
      return null
    }

    return subscription
  } catch (error) {
    console.error('Error subscribing to push notifications:', error)
    return null
  }
}

export async function testPushNotifications(): Promise<boolean> {
  const id = localStorage.getItem('subscriptionId')
  if (!id) return false
  try {
    await fetch(notificationApiUrl + '/api/test/' + id, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (err) {
    console.error('Error subscribing:', err)
    return false
  }
  return true
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.error('This browser does not support notifications')
    return 'denied'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission
  }

  return 'denied'
}

// Helper function to convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
