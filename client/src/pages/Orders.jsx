import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyOrders, cancelOrder, requestReturn, downloadInvoice } from '../services/orderService'
import { createRazorpayOrder, openRazorpayCheckout } from '../services/paymentService'
import { isPushSupported, isPushSubscribedLocally, subscribeToPush } from '../utils/push'
import { useCart } from '../context/CartContext'
import OrderStepper from '../components/OrderStepper'

const STATUS_LABEL = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  packed: 'Packed',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export default function Orders() {
  const { addToCart, openDrawer } = useCart()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [payingId, setPayingId] = useState(null)
  const [pushSubscribed, setPushSubscribed] = useState(isPushSubscribedLocally())
  const [pushBusy, setPushBusy] = useState(false)
  const [pushError, setPushError] = useState('')
  const [actionId, setActionId] = useState(null)
  const [returnFormId, setReturnFormId] = useState(null)
  const [returnReason, setReturnReason] = useState('')
  const [invoiceId, setInvoiceId] = useState(null)
  const [buyAgainNotice, setBuyAgainNotice] = useState('')

  useEffect(() => {
    fetchMyOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (order) => {
    if (!window.confirm(`Cancel order #${order.orderNumber}?`)) return
    setActionId(order._id)
    setError(null)
    try {
      const updated = await cancelOrder(order._id)
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)))
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  const handleRequestReturn = async (order) => {
    setActionId(order._id)
    setError(null)
    try {
      const updated = await requestReturn(order._id, returnReason)
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)))
      setReturnFormId(null)
      setReturnReason('')
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

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

  const handleDownloadInvoice = async (order) => {
    setInvoiceId(order._id)
    try {
      await downloadInvoice(order._id, order.orderNumber)
    } catch (err) {
      setError(err.message)
    } finally {
      setInvoiceId(null)
    }
  }

  const handleBuyAgain = (order) => {
    // Older orders placed before "Buy again" shipped won't have legacyId on
    // their items — skip those gracefully instead of adding a broken row.
    const reAddable = order.items.filter((item) => item.legacyId != null)
    if (reAddable.length === 0) {
      setBuyAgainNotice('Some items from this order are no longer available to re-add.')
      setTimeout(() => setBuyAgainNotice(''), 4000)
      return
    }
    reAddable.forEach((item) => {
      addToCart(
        { id: item.legacyId, name: item.name, price: item.price, unit: item.unit, emoji: item.emoji },
        item.qty,
      )
    })
    openDrawer()
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
      {buyAgainNotice && <p className="text-xs text-turmeric mb-4">{buyAgainNotice}</p>}

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
            <div className="flex items-center justify-between mb-4">
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
                {order.returnRequest?.status && order.returnRequest.status !== 'none' && (
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${
                      order.returnRequest.status === 'requested'
                        ? 'bg-turmeric/15 text-turmeric'
                        : order.returnRequest.status === 'approved'
                          ? 'bg-sprout/40 text-forest'
                          : 'bg-red-50 text-red-500'
                    }`}
                  >
                    Return {order.returnRequest.status}
                  </span>
                )}
              </div>
            </div>

            <div className="mb-4 overflow-x-auto">
              <OrderStepper status={order.status} />
            </div>

            <div className="flex flex-col gap-1 mb-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-charcoal/70">
                  <span>{item.emoji} {item.name} × {item.qty}</span>
                  <span className="font-mono">₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-forest/10 pt-3 flex flex-col gap-1 text-xs text-charcoal/50 mb-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono">₹{order.subtotal}</span>
              </div>
              {order.coupon?.discountAmount > 0 && (
                <div className="flex justify-between text-turmeric">
                  <span>Discount ({order.coupon.code})</span>
                  <span className="font-mono">− ₹{order.coupon.discountAmount}</span>
                </div>
              )}
              {(order.cgst > 0 || order.sgst > 0) && (
                <div className="flex justify-between">
                  <span>CGST + SGST</span>
                  <span className="font-mono">₹{(order.cgst || 0) + (order.sgst || 0)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="font-mono">{order.deliveryFee === 0 ? 'Free' : `₹${order.deliveryFee}`}</span>
              </div>
            </div>

            <div className="border-t border-forest/10 pt-3 flex items-center justify-between text-sm flex-wrap gap-2">
              <span className="text-charcoal/50">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <div className="flex items-center gap-3 flex-wrap">
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
                <button
                  onClick={() => handleDownloadInvoice(order)}
                  disabled={invoiceId === order._id}
                  className="text-xs font-medium text-charcoal/60 hover:text-forest border border-forest/15 px-3 py-1.5 rounded-full disabled:opacity-50"
                >
                  {invoiceId === order._id ? 'Preparing…' : '📄 Invoice'}
                </button>
                <button
                  onClick={() => handleBuyAgain(order)}
                  className="text-xs font-medium text-leaf hover:text-forest border border-leaf/30 px-3 py-1.5 rounded-full"
                >
                  ↻ Buy again
                </button>
                {['placed', 'confirmed'].includes(order.status) && (
                  <button
                    onClick={() => handleCancel(order)}
                    disabled={actionId === order._id}
                    className="text-xs font-medium text-red-500 hover:underline disabled:opacity-50"
                  >
                    Cancel order
                  </button>
                )}
                {order.status === 'delivered' && (order.returnRequest?.status ?? 'none') === 'none' && (
                  <button
                    onClick={() => setReturnFormId(returnFormId === order._id ? null : order._id)}
                    className="text-xs font-medium text-charcoal/50 hover:text-forest hover:underline"
                  >
                    Request return
                  </button>
                )}
              </div>
            </div>

            {returnFormId === order._id && (
              <div className="mt-3 pt-3 border-t border-forest/10 flex flex-col gap-2">
                <textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="What went wrong? (e.g. item damaged, wrong item delivered)"
                  rows={2}
                  className="bg-cream/50 border border-forest/15 rounded-xl px-3 py-2 text-sm outline-none focus-visible:border-leaf resize-none"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleRequestReturn(order)}
                    disabled={actionId === order._id || !returnReason.trim()}
                    className="bg-forest text-cream text-xs font-medium px-4 py-2 rounded-full hover:bg-leaf transition-colors disabled:opacity-50"
                  >
                    {actionId === order._id ? 'Submitting…' : 'Submit return request'}
                  </button>
                  <button
                    onClick={() => setReturnFormId(null)}
                    className="text-xs text-charcoal/40 hover:text-charcoal"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
