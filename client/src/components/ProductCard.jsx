import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

export default function ProductCard({ v, index = 0 }) {
  const { addToCart } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const wishlisted = isWishlisted(v.id)

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.06 }}
      className="relative bg-white rounded-3xl border border-forest/10 p-4 flex flex-col hover:shadow-md transition-shadow"
    >
      {v.badge && (
        <span className="absolute top-3 left-3 bg-turmeric text-white text-[10px] font-mono uppercase px-2 py-1 rounded-full z-10">
          {v.badge}
        </span>
      )}
      <button
        onClick={() => toggleWishlist(v)}
        aria-label={wishlisted ? `Remove ${v.name} from wishlist` : `Add ${v.name} to wishlist`}
        className={`absolute top-3 right-3 transition-colors z-10 ${wishlisted ? 'text-red-500' : 'text-charcoal/40 hover:text-red-500'}`}
      >
        {wishlisted ? '♥' : '♡'}
      </button>

      <Link to={`/product/${v.id}`} className="flex flex-col flex-1">
        <div className="w-full aspect-square rounded-2xl bg-sprout/40 flex items-center justify-center text-5xl mb-3">
          {v.emoji}
        </div>

        <h3 className="font-medium text-charcoal leading-tight">{v.name}</h3>
        <div className="text-xs text-charcoal/50 mt-0.5">{v.unit}</div>

        <div className="flex items-center gap-1 mt-1 text-xs text-turmeric">
          ★ <span className="text-charcoal/60">{v.rating}</span>
        </div>
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-lg text-forest font-medium">₹{v.price}</span>
        <button
          onClick={() => addToCart(v, 1)}
          className="bg-forest text-cream text-xs font-medium px-3 py-2 rounded-full hover:bg-leaf transition-colors"
        >
          Add +
        </button>
      </div>
    </motion.article>
  )
}
