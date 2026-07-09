import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyOrders } from '../services/orderService'
import { createRazorpayOrder, openRazorpayCheckout } from '../services/paymentService'
import { isPushSupported, isPushSubscribedLocally, subscribeToPush } from '../utils/push'

const STATUS_LABEL = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  packed: 'Packed',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [payingId, setPayingId] = useState(null)
  const [pushSubscribed, setPushSubscribed] = useState(isPushSubscribedLocally())
  const [pushBusy, setPushBusy] = useState(false)
  const [pushError, setPushError] = useState('')

  useEffect(() => {
    fetchMyOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const enablePush = async () => {
    setPushBusy(true)
    setPushError('')
    try {
      await subscribeToPush()
      setPushSubscribed(true)
    } catch (err) {
      setPushError(err.message)
    } finally {
      setPushBusy(false)
    }
  }

  const retryPayment = async (order) => {
    setPayingId(order._id)
    setError(null)
    try {
      const gateway = await createRazorpayOrder(order._id)
      const updated = await openRazorpayCheckout({
        orderId: order._id,
        gateway,
        customer: { name: order.deliveryAddress.name, phone: order.deliveryAddress.phone },
      })
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)))
    } catch (err) {
      setError(err.message)
    } finally {
      setPayingId(null)
    }
  }

  return (
    <section className="max-w-3xl mx-auto px-5 md:px-8 py-10">
      <h1 className="font-display text-3xl text-forest font-semibold mb-8">Your orders</h1>

      {isPushSupported() && !pushSubscribed && (
        <div className="bg-sprout/15 border border-sprout/40 rounded-2xl px-5 py-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="text-sm font-medium text-forest">Get notified on this device</p>
              <p className="text-xs text-charcoal/50">We'll ping you when your order status changes — no need to keep checking.</p>
            </div>
          </div>
          <button
            onClick={enablePush}
            disabled={pushBusy}
            className="bg-forest text-cream text-xs font-medium px-4 py-2 rounded-full hover:bg-leaf transition-colors disabled:opacity-50 shrink-0"
          >
            {pushBusy ? 'Enabling…' : 'Enable notifications'}
          </button>
        </div>
      )}
      {pushError && <p className="text-xs text-red-500 mb-4">{pushError}</p>}
      {pushSubscribed && (
        <p className="text-xs text-leaf mb-6 flex items-center gap-1.5">
          <span>✅</span> Notifications enabled on this device
        </p>
      )}

      {loading && <p className="text-sm text-charcoal/50">Loading your orders…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🧺</div>
          <p className="text-charcoal/60 mb-4">You haven't placed any orders yet.</p>
          <Link to="/shop" className="text-leaf font-medium hover:underline">
            Start shopping →
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white border border-forest/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-sm text-charcoal/60">#{order.orderNumber}</span>
              <div className="flex items-center gap-2">
                {order.paymentMethod === 'razorpay' && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      order.paymentStatus === 'paid'
                        ? 'bg-sprout/40 text-forest'
                        : order.paymentStatus === 'failed'
                          ? 'bg-red-50 text-red-500'
                          : 'bg-turmeric/15 text-turmeric'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                )}
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-sprout/30 text-forest">
                  {STATUS_LABEL[order.status] || order.status}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1 mb-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-charcoal/70">
                  <span>{item.emoji} {item.name} × {item.qty}</span>
                  <span className="font-mono">₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-forest/10 pt-3 flex items-center justify-between text-sm">
              <span className="text-charcoal/50">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-medium text-forest">Total: ₹{order.total}</span>
                {order.paymentMethod === 'razorpay' && order.paymentStatus !== 'paid' && (
                  <button
                    onClick={() => retryPayment(order)}
                    disabled={payingId === order._id}
                    className="bg-forest text-cream text-xs font-medium px-3 py-1.5 rounded-full hover:bg-leaf transition-colors disabled:opacity-50"
                  >
                    {payingId === order._id ? 'Opening…' : 'Pay Now'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
