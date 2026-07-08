import { Link, Navigate, useLocation } from 'react-router-dom'

export default function OrderConfirmation() {
  const { state } = useLocation()
  const order = state?.order

  if (!order) {
    return <Navigate to="/shop" replace />
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

      <Link to="/shop" className="bg-forest text-cream px-6 py-3 rounded-full text-sm font-medium hover:bg-leaf transition-colors">
        Continue Shopping
      </Link>
    </section>
  )
}
