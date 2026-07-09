import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { placeOrder } from '../services/orderService'
import { createRazorpayOrder, openRazorpayCheckout } from '../services/paymentService'
import AddressPicker from '../components/AddressPicker'

const SLOTS = ['7 – 9 AM', '11 AM – 1 PM', '3 – 5 PM', '6 – 8 PM']

export default function Checkout() {
  const { items, subtotal, deliveryFee, total, clearCart } = useCart()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: '', lat: null, lng: null })
  const [slot, setSlot] = useState(SLOTS[1])
  const [payment, setPayment] = useState('razorpay')
  const [placing, setPlacing] = useState(false)
  const [orderError, setOrderError] = useState(null)

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const canPlaceOrder = form.name.trim() && form.phone.trim() && form.address.trim() && items.length > 0

  if (items.length === 0) {
    return <Navigate to="/shop" replace />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: { pathname: '/checkout' } }} />
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!canPlaceOrder) return
    setOrderError(null)
    setPlacing(true)

    try {
      // 1. Create the order in our DB — always priced server-side. For COD
      //    it's done at this point; for Razorpay, payment happens next.
      const created = await placeOrder({
        items,
        deliveryAddress: { name: form.name, phone: form.phone, address: form.address, lat: form.lat, lng: form.lng },
        deliverySlot: slot,
        paymentMethod: payment,
      })

      let finalOrder = created

      if (payment === 'razorpay') {
        // 2. Ask our backend to open a Razorpay order for this exact total.
        const gateway = await createRazorpayOrder(created._id)
        // 3. Launch the Razorpay checkout modal and wait for a verified payment.
        finalOrder = await openRazorpayCheckout({
          orderId: created._id,
          gateway,
          customer: { name: form.name, phone: form.phone },
        })
      }

      const order = {
        id: finalOrder.orderNumber,
        items: finalOrder.items,
        total: finalOrder.total,
        slot: finalOrder.deliverySlot,
        name: finalOrder.deliveryAddress.name,
        address: finalOrder.deliveryAddress.address,
        lat: finalOrder.deliveryAddress.lat,
        lng: finalOrder.deliveryAddress.lng,
        paymentMethod: finalOrder.paymentMethod,
        paymentStatus: finalOrder.paymentStatus,
      }

      clearCart()
      navigate('/order-confirmation', { state: { order } })
    } catch (err) {
      // For Razorpay, the order already exists (pending) even if payment
      // failed or was cancelled — it's recoverable from Order History.
      setOrderError(
        payment === 'razorpay'
          ? `${err.message} Your order was saved — you can retry payment from Order History.`
          : err.message,
      )
    } finally {
      setPlacing(false)
    }
  }

  return (
    <section className="max-w-6xl mx-auto px-5 md:px-8 py-10">
      <nav className="text-sm text-charcoal/50 mb-6">
        <Link to="/shop" className="hover:text-leaf">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal/70">Checkout</span>
      </nav>

      <h1 className="font-display text-3xl text-forest font-semibold mb-8">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-[1.3fr,1fr] gap-10">
        <div className="flex flex-col gap-8">
          {/* Contact + address */}
          <div>
            <h2 className="font-medium text-forest mb-4">Delivery details</h2>

            {user?.addresses?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {user.addresses.map((a, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() =>
                      setForm((f) => ({ ...f, phone: a.phone, address: a.line, lat: a.lat ?? null, lng: a.lng ?? null }))
                    }
                    className={`px-4 py-2 rounded-xl text-xs font-medium border text-left transition-colors ${
                      form.address === a.line
                        ? 'bg-forest text-cream border-forest'
                        : 'bg-white border-forest/15 text-charcoal/70 hover:border-leaf'
                    }`}
                  >
                    <span className="font-semibold">{a.label}</span> · {a.line.slice(0, 28)}
                    {a.line.length > 28 ? '…' : ''}
                  </button>
                ))}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <input
                required
                placeholder="Full name"
                value={form.name}
                onChange={update('name')}
                className="bg-white border border-forest/15 rounded-xl px-4 py-3 text-sm outline-none focus-visible:border-leaf"
              />
              <input
                required
                type="tel"
                placeholder="Phone number"
                value={form.phone}
                onChange={update('phone')}
                className="bg-white border border-forest/15 rounded-xl px-4 py-3 text-sm outline-none focus-visible:border-leaf"
              />
              <AddressPicker
                value={form.address}
                onChange={({ address, lat, lng }) => setForm((f) => ({ ...f, address, lat, lng }))}
              />
            </div>
          </div>

          {/* Delivery slot */}
          <div>
            <h2 className="font-medium text-forest mb-4">Delivery slot</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SLOTS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSlot(s)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    slot === s
                      ? 'bg-forest text-cream border-forest'
                      : 'bg-white text-charcoal/70 border-forest/15 hover:border-leaf'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Payment method */}
          <div>
            <h2 className="font-medium text-forest mb-4">Payment method</h2>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 bg-white border border-forest/15 rounded-xl px-4 py-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={payment === 'razorpay'}
                  onChange={() => setPayment('razorpay')}
                />
                <span className="text-sm">Card / UPI / Netbanking (Razorpay)</span>
              </label>
              <label className="flex items-center gap-3 bg-white border border-forest/15 rounded-xl px-4 py-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={payment === 'cod'}
                  onChange={() => setPayment('cod')}
                />
                <span className="text-sm">Cash on Delivery</span>
              </label>
            </div>
            <p className="text-xs text-charcoal/40 mt-2">
              Card/UPI/Netbanking opens Razorpay's secure checkout. Use Razorpay's test card
              4111 1111 1111 1111 (any future date, any CVV) in test mode.
            </p>
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white border border-forest/10 rounded-3xl p-6 h-fit sticky top-24">
          <h2 className="font-medium text-forest mb-4">Order summary</h2>
          <div className="flex flex-col gap-3 max-h-64 overflow-y-auto mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sprout/40 flex items-center justify-center text-xl shrink-0">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0 text-sm">
                  <div className="truncate">{item.name} <span className="text-charcoal/40">× {item.qty}</span></div>
                </div>
                <span className="font-mono text-sm text-forest">₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-forest/10 pt-4 flex flex-col gap-1.5 text-sm text-charcoal/60">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono">₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span className="font-mono">{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-forest font-medium text-base pt-1">
              <span>Total</span>
              <span className="font-mono">₹{total}</span>
            </div>
          </div>

          {orderError && <p className="text-sm text-red-600 mt-3">{orderError}</p>}

          <button
            type="submit"
            disabled={!canPlaceOrder || placing}
            className="w-full mt-5 bg-forest text-cream font-medium py-3 rounded-full hover:bg-leaf transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {placing ? 'Placing order…' : `Place Order · ₹${total}`}
          </button>
        </div>
      </form>
    </section>
  )
}
