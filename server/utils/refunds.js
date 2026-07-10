import Order from '../models/Order.js'
import User from '../models/User.js'
import getRazorpay from '../config/razorpay.js'
import { sendPushToUser } from './webpush.js'

// Only orders actually paid via Razorpay can be auto-refunded to the
// original payment method — COD orders never touched a payment gateway,
// and neither did a Razorpay order whose status was only ever set by hand
// (no real razorpayPaymentId). Both cases fall back to store credit instead
// (see creditWallet below) rather than needing a manual admin action.
export function isAutoRefundable(order) {
  return order.paymentMethod === 'razorpay' && order.paymentStatus === 'paid' && !!order.razorpayPaymentId
}

// Credits the order's total straight to the customer's wallet — this is
// the realistic equivalent of what Amazon-style platforms do for COD
// returns (an instant "store balance" refund, no bank details needed).
// Always succeeds (a DB update, no external API), so there's no
// processing/failed state to model here unlike the Razorpay path.
// If the customer paid part of this order with wallet balance at checkout,
// that portion was never part of `order.total` (see orderController.js),
// so it needs restoring separately from whichever refund path runs above.
async function restoreWalletUsage(order) {
  if (!order.walletAmountUsed || order.walletAmountUsed <= 0) return
  const user = await User.findById(order.user)
  if (user) {
    user.walletBalance += order.walletAmountUsed
    await user.save()
  }
}

async function creditWallet(order) {
  const user = await User.findById(order.user)
  if (user) {
    user.walletBalance += order.total
    await user.save()
  }

  order.returnRequest.refund = {
    status: 'completed',
    method: 'wallet',
    amount: order.total,
    processedAt: new Date(),
  }
  await order.save()
  await restoreWalletUsage(order)

  sendPushToUser(order.user, {
    title: `Order #${order.orderNumber}`,
    body: `₹${order.total} has been added to your Organic Fresh wallet balance.`,
    url: '/account',
  })

  return order
}

// Actually issues the refund for this order's return — routes to a real
// Razorpay refund when possible, otherwise falls back to wallet credit.
// Safe to call from either the "approve now" path or the scheduled-refund
// processor below — both end up here. Never throws; failures are recorded
// on the order instead, since a failed refund shouldn't ever look like a
// crashed request to the caller.
export async function issueRefund(order) {
  if (!isAutoRefundable(order)) {
    return creditWallet(order)
  }

  order.returnRequest.refund.status = 'processing'
  order.returnRequest.refund.method = 'razorpay'
  await order.save()

  try {
    const amountPaise = Math.round(order.total * 100)
    const refund = await getRazorpay().payments.refund(order.razorpayPaymentId, {
      amount: amountPaise,
      speed: 'normal',
      notes: { orderNumber: order.orderNumber, reason: order.returnRequest.reason || 'Customer return' },
    })

    order.returnRequest.refund.status = 'completed'
    order.returnRequest.refund.amount = order.total
    order.returnRequest.refund.razorpayRefundId = refund.id
    order.returnRequest.refund.processedAt = new Date()
    order.paymentStatus = 'refunded'
    await order.save()
    await restoreWalletUsage(order)

    sendPushToUser(order.user, {
      title: `Order #${order.orderNumber}`,
      body: `Your refund of ₹${order.total} has been processed.`,
      url: '/orders',
    })
  } catch (err) {
    order.returnRequest.refund.status = 'failed'
    order.returnRequest.refund.failureReason = err.message || 'Refund failed — please retry from the admin dashboard.'
    await order.save()
    console.error(`[refund] Failed for order ${order.orderNumber}:`, err.message)
  }

  return order
}

// Finds every return whose refund was scheduled for a date/time that has
// now passed, and processes them. Called on an interval from server.js, and
// also exposed as a manual "process due refunds" admin action — the manual
// trigger matters because Render's free tier sleeps the server after
// inactivity, so a background timer alone isn't reliable for exact timing.
export async function processDueScheduledRefunds() {
  const due = await Order.find({
    'returnRequest.refund.status': 'scheduled',
    'returnRequest.refund.scheduledFor': { $lte: new Date() },
  })

  const results = []
  for (const order of due) {
    results.push(await issueRefund(order))
  }
  return results
}
