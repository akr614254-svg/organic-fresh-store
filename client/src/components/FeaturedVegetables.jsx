import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'
import { fetchAllProducts } from '../services/productService'

export default function FeaturedVegetables() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllProducts()
      .then((items) => {
        const topRated = [...items].sort((a, b) => b.rating - a.rating).slice(0, 8)
        setFeatured(topRated)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="shop" className="max-w-7xl mx-auto px-5 md:px-8 py-14">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-wide text-leaf">Picked for you</span>
          <h2 className="font-display text-3xl text-forest font-semibold mt-1">Featured vegetables</h2>
        </div>
        <Link to="/shop" className="text-sm font-medium text-leaf hover:text-forest hidden sm:block">
          View all →
        </Link>
      </div>

      {loading && <p className="text-sm text-charcoal/50">Loading…</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {featured.map((v, i) => (
          <ProductCard v={v} index={i} key={v.id} />
        ))}
      </div>
    </section>
  )
}
