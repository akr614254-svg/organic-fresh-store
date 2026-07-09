import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { categories, vegetables } from '../data/vegetables'

const SORTS = [
  { id: 'popular', label: 'Most Popular' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'rating', label: 'Top Rated' },
]

const PRICE_CEILING = Math.max(...vegetables.map((v) => v.price))

export default function Products() {
  const [params, setParams] = useSearchParams()
  const activeCategory = params.get('category') || 'all'
  const [query, setQuery] = useState(params.get('q') || '')
  const [sort, setSort] = useState('popular')
  const [maxPrice, setMaxPrice] = useState(PRICE_CEILING)
  const [minRating, setMinRating] = useState(0)

  const setCategory = (id) => {
    const next = new URLSearchParams(params)
    if (id === 'all') next.delete('category')
    else next.set('category', id)
    setParams(next)
  }

  const results = useMemo(() => {
    let list = vegetables.filter((v) =>
      activeCategory === 'all' ? true : v.category === activeCategory,
    )

    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((v) => v.name.toLowerCase().includes(q))
    }

    list = list.filter((v) => v.price <= maxPrice && v.rating >= minRating)

    switch (sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        list = [...list].sort((a, b) => b.price - a.price)
        break
      case 'rating':
        list = [...list].sort((a, b) => b.rating - a.rating)
        break
      default:
        break
    }

    return list
  }, [activeCategory, query, sort, maxPrice, minRating])

  return (
    <section className="max-w-7xl mx-auto px-5 md:px-8 py-10">
      <div className="mb-8">
        <span className="text-xs font-mono uppercase tracking-wide text-leaf">Full catalog</span>
        <h1 className="font-display text-3xl md:text-4xl text-forest font-semibold mt-1">
          Shop fresh vegetables
        </h1>
      </div>

      {/* Search */}
      <div className="flex items-center bg-white rounded-full shadow-sm border border-forest/10 p-1.5 max-w-md mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search spinach, carrots, mint..."
          className="flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-charcoal/40"
        />
        <span className="px-3 text-charcoal/40">🔍</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-forest text-cream'
                : 'bg-white border border-forest/10 text-charcoal/70 hover:border-leaf'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === c.id
                  ? 'bg-forest text-cream'
                  : 'bg-white border border-forest/10 text-charcoal/70 hover:border-leaf'
              }`}
            >
              {c.emoji} {c.name}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-white border border-forest/10 rounded-full px-4 py-2 text-sm text-charcoal/70 outline-none w-fit"
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-6 mb-6 bg-white border border-forest/10 rounded-2xl px-5 py-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-charcoal/60 whitespace-nowrap">
            Max price: <span className="font-medium text-forest">₹{maxPrice}</span>
          </label>
          <input
            type="range"
            min={0}
            max={PRICE_CEILING}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-40 accent-leaf"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-charcoal/60">Min rating:</span>
          {[0, 3, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                minRating === r
                  ? 'bg-forest text-cream'
                  : 'bg-cream border border-forest/10 text-charcoal/60 hover:border-leaf'
              }`}
            >
              {r === 0 ? 'Any' : `★ ${r}+`}
            </button>
          ))}
        </div>

        {(maxPrice !== PRICE_CEILING || minRating !== 0) && (
          <button
            onClick={() => {
              setMaxPrice(PRICE_CEILING)
              setMinRating(0)
            }}
            className="text-xs text-charcoal/40 hover:text-leaf underline underline-offset-2 ml-auto"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="text-sm text-charcoal/50 mb-4">{results.length} items</p>

      {results.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">🌱</div>
          <p className="text-charcoal/60">
            Nothing matches "{query}". Try a different search or category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 pb-16">
          {results.map((v, i) => (
            <ProductCard v={v} index={i} key={v.id} />
          ))}
        </div>
      )}
    </section>
  )
}
