import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { downloadInvoice } from '../services/orderService'

export default function OrderConfirmation() {
  const { state } = useLocation()
  const order = state?.order
  const [downloading, setDownloading] = useState(false)

  if (!order) {
    return <Navigate to="/shop" replace />
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await downloadInvoice(order._id, order.id)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <section className="max-w-xl mx-auto px-5 py-20 text-center">
      <div className="text-6xl mb-5">✅</div>
      <h1 className="font-display text-3xl text-forest font-semibold mb-2">Order placed!</h1>
      <p className="text-charcoal/60 mb-1">
        Thanks{order.name ? `, ${order.name}` : ''} — your fresh produce is on its way.
      </p>
      <p className="text-charcoal/40 text-sm mb-8 font-mono">Order #{order.id}</p>

      <div className="bg-white border border-forest/10 rounded-3xl p-6 text-left mb-8">
        <div className="flex justify-between text-sm text-charcoal/60 mb-3">
          <span>Delivery slot</span>
          <span className="font-medium text-charcoal">{order.slot}</span>
        </div>
        <div className="flex justify-between text-sm text-charcoal/60 mb-4">
          <span>Delivering to</span>
          <span className="font-medium text-charcoal text-right max-w-[60%]">
            {order.address}
            {order.lat && order.lng && (
              <>
                {' '}
                <a
                  href={`https://www.google.com/maps?q=${order.lat},${order.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-leaf hover:text-forest underline underline-offset-2"
                >
                  View on map
                </a>
              </>
            )}
          </span>
        </div>
        <div className="border-t border-forest/10 pt-3 flex flex-col gap-1.5">
          {order.items.map((item, i) => (
            <div key={item.product || item.name || i} className="flex justify-between text-sm text-charcoal/70">
              <span>{item.emoji} {item.name} × {item.qty}</span>
              <span className="font-mono">₹{item.price * item.qty}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-forest/10 mt-3 pt-3 flex flex-col gap-1.5 text-sm text-charcoal/60">
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
          <div className="flex justify-between">
            <span>CGST (2.5%)</span>
            <span className="font-mono">₹{order.cgst}</span>
          </div>
          <div className="flex justify-between">
            <span>SGST (2.5%)</span>
            <span className="font-mono">₹{order.sgst}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span className="font-mono">{order.deliveryFee === 0 ? 'Free' : `₹${order.deliveryFee}`}</span>
          </div>
        </div>

        {order.paymentMethod && (
          <div className="flex justify-between text-sm text-charcoal/60 mt-3">
            <span>Payment</span>
            <span className="font-medium text-charcoal capitalize">
              {order.paymentMethod === 'razorpay'
                ? order.paymentStatus === 'paid' ? 'Paid online' : 'Payment pending'
                : 'Cash on delivery'}
            </span>
          </div>
        )}
        <div className="border-t border-forest/10 mt-3 pt-3 flex justify-between font-medium text-forest">
          <span>Total</span>
          <span className="font-mono text-lg">₹{order.total}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Link to="/shop" className="bg-forest text-cream px-6 py-3 rounded-full text-sm font-medium hover:bg-leaf transition-colors">
          Continue Shopping
        </Link>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="border border-forest/15 text-forest px-6 py-3 rounded-full text-sm font-medium hover:bg-sprout/20 transition-colors disabled:opacity-50"
        >
          {downloading ? 'Preparing…' : '📄 Download Invoice'}
        </button>
      </div>
    </section>
  )
}
