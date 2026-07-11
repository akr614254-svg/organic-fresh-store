import Cart from '../models/Cart.js'
import User from '../models/User.js'
import { sendPushToUser } from './webpush.js'
import { sendCustomerEmail } from './notify.js'

// How long a cart has to sit untouched before we consider it "abandoned"
// and worth a nudge. Configurable so a lower value is easy to use for
// testing without touching code.
const ABANDONED_AFTER_MS = (Number(process.env.ABANDONED_CART_MINUTES) || 60) * 60 * 1000

function cartSummaryText(cart) {
  const itemLines = cart.items.map((i) => `  • ${i.name} x${i.qty}`).join('\n')
  const total = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0)
  return (
    `You left ${cart.items.length} item${cart.items.length === 1 ? '' : 's'} in your Organic Fresh cart ` +
    `(₹${total}):\n\n${itemLines}\n\nCome back and check out before they sell out!`
  )
}

// Best-effort, like the refund checker in server.js: only fires while the
// server is awake, and never throws (a failed reminder should never crash
// the interval it's running on).
export async function checkAbandonedCarts() {
  const cutoff = new Date(Date.now() - ABANDONED_AFTER_MS)

  const staleCarts = await Cart.find({
    updatedAt: { $lte: cutoff },
    reminderSentAt: null,
    'items.0': { $exists: true }, // non-empty cart only
  })

  for (const cart of staleCarts) {
    const user = await User.findById(cart.user)
    if (!user) continue

    const body = `You left ${cart.items.length} item${cart.items.length === 1 ? '' : 's'} in your cart — come back and grab them!`
    await Promise.allSettled([
      sendPushToUser(user._id, { title: 'Still thinking it over? 🥬', body, url: '/shop' }),
      sendCustomerEmail(user.email, 'You left something in your cart 🌱', cartSummaryText(cart)),
    ])

    cart.reminderSentAt = new Date()
    await cart.save()
  }

  return staleCarts.length
}
