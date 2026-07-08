import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { vegetables, categories } from '../data/vegetables'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

export default function ProductDetails() {
  const { id } = useParams()
  const product = vegetables.find((v) => String(v.id) === id)
  const [qty, setQty] = useState(1)
  const { addToCart } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()

  if (!product) {
    return (
      <section className="max-w-3xl mx-auto px-5 py-24 text-center">
        <div className="text-5xl mb-4">🥕</div>
        <h1 className="font-display text-2xl text-forest mb-2">Product not found</h1>
        <p className="text-charcoal/60 mb-6">
          That vegetable might have sold out or moved. Let's get you back to the shop.
        </p>
        <Link to="/shop" className="bg-forest text-cream px-5 py-2.5 rounded-full text-sm font-medium hover:bg-leaf transition-colors">
          Back to Shop
        </Link>
      </section>
    )
  }

  const category = categories.find((c) => c.id === product.category)
  const related = vegetables
    .filter((v) => v.category === product.category && v.id !== product.id)
    .slice(0, 4)

  return (
    <section className="max-w-6xl mx-auto px-5 md:px-8 py-10">
      <nav className="text-sm text-charcoal/50 mb-6">
        <Link to="/" className="hover:text-leaf">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-leaf">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal/70">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="bg-sprout/40 rounded-3xl aspect-square flex items-center justify-center text-[8rem]">
          {product.emoji}
        </div>

        <div>
          {product.badge && (
            <span className="inline-block bg-turmeric text-white text-[10px] font-mono uppercase px-2 py-1 rounded-full mb-3">
              {product.badge}
            </span>
          )}
          <h1 className="font-display text-3xl md:text-4xl text-forest font-semibold">{product.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-charcoal/60">
            <span className="text-turmeric">★ {product.rating}</span>
            <span>·</span>
            <span>{category?.name}</span>
          </div>

          <p className="mt-5 text-charcoal/70 leading-relaxed max-w-md">{product.desc}</p>

          <div className="mt-6 flex items-baseline gap-2">
            <span className="font-mono text-3xl text-forest font-semibold">₹{product.price}</span>
            <span className="text-charcoal/50 text-sm">/ {product.unit}</span>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-forest/15 rounded-full">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-10 text-forest hover:bg-sprout/30 rounded-full"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-8 text-center font-mono">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-10 h-10 text-forest hover:bg-sprout/30 rounded-full"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              onClick={() => addToCart(product, qty)}
              className="flex-1 bg-forest text-cream font-medium px-6 py-3 rounded-full hover:bg-leaf transition-colors"
            >
              Add to Cart · ₹{product.price * qty}
            </button>
          </div>

          <button
            onClick={() => toggleWishlist(product)}
            className={`mt-3 w-full border font-medium px-6 py-3 rounded-full transition-colors ${
              isWishlisted(product.id)
                ? 'border-red-200 bg-red-50 text-red-500'
                : 'border-forest/15 text-forest hover:bg-sprout/20'
            }`}
          >
            {isWishlisted(product.id) ? '♥ Saved to Wishlist' : '♡ Add to Wishlist'}
          </button>

          <div className="mt-8 grid grid-cols-2 gap-3 text-sm text-charcoal/60">
            <div className="bg-white border border-forest/10 rounded-2xl p-3">🚚 Delivered in 90 min</div>
            <div className="bg-white border border-forest/10 rounded-2xl p-3">🌱 100% organic sourced</div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl text-forest font-semibold mb-6">
            You might also like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {related.map((v, i) => (
              <ProductCard v={v} index={i} key={v.id} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
