import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQty,
    removeFromCart,
    subtotal,
    deliveryFee,
    total,
    freeDeliveryThreshold,
  } = useCart()

  const remainingForFree = Math.max(0, freeDeliveryThreshold - subtotal)

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal/40 z-[60]"
            onClick={closeDrawer}
          />
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-cream z-[70] flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 h-16 border-b border-forest/10">
              <h2 className="font-display text-xl text-forest font-semibold">
                Your Cart {items.length > 0 && <span className="text-sm text-charcoal/50 font-body">({items.length})</span>}
              </h2>
              <button onClick={closeDrawer} aria-label="Close cart" className="text-2xl text-charcoal/60 hover:text-forest">
                ✕
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <div className="text-5xl mb-3">🧺</div>
                <p className="text-charcoal/60 mb-5">Your cart is empty. Fresh veggies are one tap away.</p>
                <Link
                  to="/shop"
                  onClick={closeDrawer}
                  className="bg-forest text-cream px-5 py-2.5 rounded-full text-sm font-medium hover:bg-leaf transition-colors"
                >
                  Browse the Shop
                </Link>
              </div>
            ) : (
              <>
                {remainingForFree > 0 && (
                  <div className="mx-5 mt-4 bg-turmeric/15 text-turmeric text-xs font-mono px-3 py-2 rounded-full text-center">
                    Add ₹{remainingForFree} more for free delivery
                  </div>
                )}

                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="w-14 h-14 rounded-2xl bg-sprout/40 flex items-center justify-center text-2xl shrink-0">
                        {item.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-charcoal text-sm truncate">{item.name}</div>
                        <div className="text-xs text-charcoal/50">{item.unit}</div>
                        <div className="font-mono text-sm text-forest mt-0.5">₹{item.price * item.qty}</div>
                      </div>
                      <div className="flex items-center border border-forest/15 rounded-full shrink-0">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="w-8 h-8 text-forest hover:bg-sprout/30 rounded-full"
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-mono text-sm">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="w-8 h-8 text-forest hover:bg-sprout/30 rounded-full"
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="text-charcoal/30 hover:text-red-500 text-sm shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-forest/10 px-5 py-4">
                  <div className="flex items-center justify-between text-sm text-charcoal/60 mb-1">
                    <span>Subtotal</span>
                    <span className="font-mono">₹{subtotal}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-charcoal/60 mb-3">
                    <span>Delivery</span>
                    <span className="font-mono">{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span>
                  </div>
                  <div className="flex items-center justify-between font-medium text-forest mb-4">
                    <span>Total</span>
                    <span className="font-mono text-lg">₹{total}</span>
                  </div>
                  <Link
                    to="/checkout"
                    onClick={closeDrawer}
                    className="block text-center bg-forest text-cream font-medium py-3 rounded-full hover:bg-leaf transition-colors"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
