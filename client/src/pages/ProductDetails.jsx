import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import StarRating from '../components/StarRating'
import { categories } from '../data/vegetables'
import { fetchProductByLegacyId, fetchAllProducts, fetchFrequentlyBoughtTogether } from '../services/productService'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { fetchReviews, submitReview, deleteMyReview } from '../services/reviewService'

export default function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [boughtTogether, setBoughtTogether] = useState([])
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const { addToCart } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const { isAuthenticated, user } = useAuth()

  const [reviews, setReviews] = useState([])
  const [ratingSummary, setRatingSummary] = useState({ avgRating: null, count: 0 })
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')

  const myExistingReview = reviews.find((r) => r.user === user?.id)

  useEffect(() => {
    setLoading(true)
    setQty(1)
    fetchProductByLegacyId(id)
      .then(async (p) => {
        setProduct(p)
        if (p) {
          const all = await fetchAllProducts()
          setRelated(all.filter((v) => v.category === p.category && v.id !== p.id).slice(0, 4))
          fetchFrequentlyBoughtTogether(p.id)
            .then(setBoughtTogether)
            .catch(() => setBoughtTogether([]))
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!product) return
    setReviewsLoading(true)
    fetchReviews(product.id)
      .then(({ reviews, summary }) => {
        setReviews(reviews)
        setRatingSummary(summary)
        const mine = reviews.find((r) => r.user === user?.id)
        if (mine) {
          setMyRating(mine.rating)
          setMyComment(mine.comment)
        }
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id])

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!myRating) {
      setReviewError('Pick a star rating first.')
      return
    }
    setSubmittingReview(true)
    setReviewError('')
    try {
      const saved = await submitReview(product.id, { rating: myRating, comment: myComment })
      setReviews((prev) => {
        const withoutMine = prev.filter((r) => r.user !== user.id)
        return [saved, ...withoutMine]
      })
      const { summary } = await fetchReviews(product.id)
      setRatingSummary(summary)
    } catch (err) {
      setReviewError(err.message)
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleDeleteReview = async () => {
    try {
      await deleteMyReview(product.id)
      setReviews((prev) => prev.filter((r) => r.user !== user.id))
      setMyRating(0)
      setMyComment('')
      const { summary } = await fetchReviews(product.id)
      setRatingSummary(summary)
    } catch (err) {
      setReviewError(err.message)
    }
  }

  if (loading) {
    return (
      <section className="max-w-3xl mx-auto px-5 py-24 text-center text-charcoal/50">
        Loading…
      </section>
    )
  }

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
  const outOfStock = product.stock <= 0
  const lowStock = product.stock > 0 && product.stock <= 5

  return (
    <section className="max-w-6xl mx-auto px-5 md:px-8 py-10">
      <Helmet>
        <title>{product.name} — Organic Fresh Store</title>
        <meta name="description" content={`Buy fresh ${product.name} online, ₹${product.price} per ${product.unit}. Organic, locally sourced, delivered to your door.`} />
      </Helmet>
      <nav className="text-sm text-charcoal/50 mb-6">
        <Link to="/" className="hover:text-leaf">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-leaf">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal/70">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="bg-sprout/40 rounded-3xl aspect-square flex items-center justify-center text-[8rem] overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            product.emoji
          )}
        </div>

        <div>
          {product.badge && (
            <span className="inline-block bg-turmeric text-white text-[10px] font-mono uppercase px-2 py-1 rounded-full mb-3">
              {product.badge}
            </span>
          )}
          <h1 className="font-display text-3xl md:text-4xl text-forest font-semibold">{product.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-charcoal/60">
            <span className="text-turmeric flex items-center gap-1">
              <StarRating value={ratingSummary.avgRating ?? product.rating} />
              {ratingSummary.avgRating ?? product.rating}
              {ratingSummary.count > 0 && <span className="text-charcoal/40">({ratingSummary.count})</span>}
            </span>
            <span>·</span>
            <span>{category?.name}</span>
          </div>

          <p className="mt-5 text-charcoal/70 leading-relaxed max-w-md">{product.desc}</p>

          <div className="mt-6 flex items-baseline gap-2">
            <span className="font-mono text-3xl text-forest font-semibold">₹{product.price}</span>
            <span className="text-charcoal/50 text-sm">/ {product.unit}</span>
          </div>

          {outOfStock ? (
            <p className="mt-2 text-sm font-medium text-red-500">Out of stock</p>
          ) : lowStock ? (
            <p className="mt-2 text-sm font-medium text-turmeric">Only {product.stock} left</p>
          ) : null}

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-forest/15 rounded-full">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={outOfStock}
                className="w-10 h-10 text-forest hover:bg-sprout/30 rounded-full disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-8 text-center font-mono">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                disabled={outOfStock || qty >= product.stock}
                className="w-10 h-10 text-forest hover:bg-sprout/30 rounded-full disabled:opacity-40"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              onClick={() => addToCart(product, qty)}
              disabled={outOfStock}
              className="flex-1 bg-forest text-cream font-medium px-6 py-3 rounded-full hover:bg-leaf transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {outOfStock ? 'Out of Stock' : `Add to Cart · ₹${product.price * qty}`}
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

      {/* Reviews */}
      <div className="mt-16 max-w-2xl">
        <h2 className="font-display text-2xl text-forest font-semibold mb-6">
          Reviews {ratingSummary.count > 0 && <span className="text-charcoal/40 text-lg">({ratingSummary.count})</span>}
        </h2>

        {isAuthenticated ? (
          <form onSubmit={handleSubmitReview} className="bg-white border border-forest/10 rounded-2xl p-5 mb-6">
            <p className="text-sm font-medium text-forest mb-2">
              {myExistingReview ? 'Edit your review' : 'Leave a review'}
            </p>
            <StarRating value={myRating} onChange={setMyRating} interactive size="text-2xl" />
            <textarea
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              placeholder="What did you think? (optional)"
              rows={3}
              className="w-full mt-3 bg-cream/50 border border-forest/15 rounded-xl px-4 py-2.5 text-sm outline-none focus-visible:border-leaf resize-none"
            />
            {reviewError && <p className="text-xs text-red-500 mt-2">{reviewError}</p>}
            <div className="flex items-center gap-3 mt-3">
              <button
                type="submit"
                disabled={submittingReview}
                className="bg-forest text-cream text-sm font-medium px-5 py-2 rounded-full hover:bg-leaf transition-colors disabled:opacity-50"
              >
                {submittingReview ? 'Saving…' : myExistingReview ? 'Update review' : 'Submit review'}
              </button>
              {myExistingReview && (
                <button type="button" onClick={handleDeleteReview} className="text-xs text-red-500 hover:underline">
                  Delete my review
                </button>
              )}
            </div>
          </form>
        ) : (
          <p className="text-sm text-charcoal/50 mb-6">
            <Link to="/login" className="text-leaf hover:underline">Log in</Link> to leave a review.
          </p>
        )}

        {reviewsLoading && <p className="text-sm text-charcoal/40">Loading reviews…</p>}

        {!reviewsLoading && reviews.length === 0 && (
          <p className="text-sm text-charcoal/40">No reviews yet — be the first to share your thoughts.</p>
        )}

        <div className="flex flex-col gap-4">
          {reviews.map((r) => (
            <div key={r._id} className="border-b border-forest/10 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-forest">{r.userName}</span>
                <StarRating value={r.rating} size="text-sm" />
              </div>
              {r.comment && <p className="text-sm text-charcoal/60 mt-1">{r.comment}</p>}
              <p className="text-xs text-charcoal/30 mt-1">
                {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {boughtTogether.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl text-forest font-semibold mb-1">
            Frequently bought together
          </h2>
          <p className="text-sm text-charcoal/50 mb-6">Based on what other customers ordered alongside this.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {boughtTogether.map((v, i) => (
              <ProductCard v={v} index={i} key={v.id} />
            ))}
          </div>
        </div>
      )}

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
