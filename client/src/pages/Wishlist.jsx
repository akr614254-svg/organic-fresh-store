import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'

export default function Wishlist() {
  const { items, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()

  if (items.length === 0) {
    return (
      <section className="max-w-3xl mx-auto px-5 py-24 text-center">
        <div className="text-5xl mb-4">♡</div>
        <h1 className="font-display text-2xl text-forest mb-2">Your wishlist is empty</h1>
        <p className="text-charcoal/60 mb-6">Tap the heart on any vegetable to save it for later.</p>
        <Link to="/shop" className="bg-forest text-cream px-5 py-2.5 rounded-full text-sm font-medium hover:bg-leaf transition-colors">
          Browse the Shop
        </Link>
      </section>
    )
  }

  return (
    <section className="max-w-5xl mx-auto px-5 md:px-8 py-10">
      <div className="mb-8">
        <span className="text-xs font-mono uppercase tracking-wide text-leaf">Saved for later</span>
        <h1 className="font-display text-3xl text-forest font-semibold mt-1">Your Wishlist</h1>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((v) => (
          <div key={v.id} className="flex items-center gap-4 bg-white border border-forest/10 rounded-2xl p-4">
            <Link to={`/product/${v.id}`} className="w-16 h-16 rounded-xl bg-sprout/40 flex items-center justify-center text-3xl shrink-0">
              {v.emoji}
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/product/${v.id}`} className="font-medium text-charcoal hover:text-leaf">
                {v.name}
              </Link>
              <div className="text-xs text-charcoal/50">{v.unit}</div>
              <div className="font-mono text-forest mt-0.5">₹{v.price}</div>
            </div>
            <button
              onClick={() => addToCart(v, 1)}
              className="bg-forest text-cream text-sm font-medium px-4 py-2 rounded-full hover:bg-leaf transition-colors shrink-0"
            >
              Add to Cart
            </button>
            <button
              onClick={() => removeFromWishlist(v.id)}
              aria-label={`Remove ${v.name} from wishlist`}
              className="text-charcoal/30 hover:text-red-500 shrink-0"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
