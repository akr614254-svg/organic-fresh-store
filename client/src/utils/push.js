import api from '../services/api'

// Web Push subscriptions need the VAPID public key as a raw Uint8Array,
// but it's handed out as a URL-safe base64 string — this converts it.
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window
}

// Registers the service worker up front (safe to call on every page load —
// it's a no-op if already registered). Does NOT ask for notification
// permission; that only happens when subscribe() is called from a real
// button click, per browser best practice.
export async function registerServiceWorker() {
  if (!isPushSupported()) return null
  try {
    return await navigator.serviceWorker.register('/sw.js')
  } catch (err) {
    console.error('Service worker registration failed:', err)
    return null
  }
}

// Call this from a button click handler. Asks for notification permission,
// subscribes this browser/device, and saves it on the server against the
// logged-in user.
export async function subscribeToPush() {
  if (!isPushSupported()) {
    throw new Error('Push notifications aren\u2019t supported on this browser/device.')
  }

  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (!vapidKey) {
    throw new Error('Push notifications aren\u2019t configured yet.')
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted.')
  }

  const registration = await registerServiceWorker()
  if (!registration) throw new Error('Could not set up notifications on this device.')

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  })

  const raw = subscription.toJSON()
  await api.post('/push/subscribe', { endpoint: raw.endpoint, keys: raw.keys })

  localStorage.setItem('of_push_subscribed', 'true')
  return subscription
}

export async function unsubscribeFromPush() {
  if (!isPushSupported()) return
  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration?.pushManager.getSubscription()
  if (subscription) {
    await api.post('/push/unsubscribe', { endpoint: subscription.endpoint })
    await subscription.unsubscribe()
  }
  localStorage.removeItem('of_push_subscribed')
}

// Best-effort local check (not a guarantee the server still has it —
// mainly used to decide whether to show "Enable" vs "Enabled" in the UI).
export function isPushSubscribedLocally() {
  return Notification?.permission === 'granted' && localStorage.getItem('of_push_subscribed') === 'true'
}
