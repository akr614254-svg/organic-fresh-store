import Order from '../models/Order.js'
import getRazorpay from '../config/razorpay.js'
import { sendPushToUser } from './webpush.js'

// Only orders actually paid via Razorpay can be auto-refunded — COD orders
// never touched a payment gateway, so any "refund" there is a manual cash
// handback the admin does themselves. This just tells the caller whether
// automatic refunding is even possible for a given order.
export function isAutoRefundable(order) {
  return order.paymentMethod === 'razorpay' && order.paymentStatus === 'paid' && !!order.razorpayPaymentId
}

// Actually calls Razorpay's refund API for this order's payment and updates
// the order's refund sub-state accordingly. Safe to call from either the
// "approve now" path or the scheduled-refund processor below — both end up
// here. Never throws; failures are recorded on the order instead, since a
// failed refund shouldn't ever look like a crashed request to the caller.
export async function issueRefund(order) {
  if (!isAutoRefundable(order)) {
    order.returnRequest.refund.status = 'failed'
    order.returnRequest.refund.failureReason = 'Order was not paid online — refund the customer manually (e.g. cash).'
    await order.save()
    return order
  }

  order.returnRequest.refund.status = 'processing'
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
