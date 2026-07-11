import webpush from 'web-push'
import PushSubscription from '../models/PushSubscription.js'

let configured = false

function ensureConfigured() {
  if (configured) return true
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return false

  webpush.setVapidDetails(
    VAPID_SUBJECT || 'mailto:admin@example.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
  )
  configured = true
  return true
}

// Sends a browser push notification to every device a user has subscribed
// on. Best-effort: never throws, so a missing VAPID setup or a stale
// subscription never breaks the order-status update that triggered it.
export async function sendPushToUser(userId, { title, body, url }) {
  if (!userId) return // guest orders have no user to push to
  if (!ensureConfigured()) {
    console.warn('[push] Skipping push notification — VAPID keys not configured')
    return
  }

  const subs = await PushSubscription.find({ user: userId })
  if (subs.length === 0) return

  const payload = JSON.stringify({ title, body, url: url || '/orders' })

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload,
        )
      } catch (err) {
        // 410 Gone / 404 means the browser dropped this subscription
        // (e.g. user cleared site data) — clean it up so we stop trying.
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushSubscription.deleteOne({ _id: sub._id })
        } else {
          console.error('[push] Failed to send notification:', err.message)
        }
      }
    }),
  )
}
