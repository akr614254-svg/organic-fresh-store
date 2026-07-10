import api from './api'

// Cart, wishlist, orders, and reviews all key products by the numeric
// `legacyId` (see server/models/Product.js), not Mongo's `_id`. Normalizing
// here means every existing component built around `v.id` keeps working
// unchanged, whether that product came from the original seed or was
// created later in the admin dashboard (which auto-assigns a legacyId too).
function normalize(p) {
  return {
    id: p.legacyId,
    _id: p._id,
    name: p.name,
    category: p.category,
    price: p.price,
    unit: p.unit,
    emoji: p.emoji || '🥬',
    imageUrl: p.imageUrl || '',
    rating: p.rating,
    badge: p.badge,
    desc: p.desc,
    stock: p.stock,
  }
}

export async function fetchAllProducts() {
  const { data } = await api.get('/products', { params: { limit: 500 } })
  return data.items.filter((p) => p.legacyId != null).map(normalize)
}

export async function fetchProductByLegacyId(legacyId) {
  const { data } = await api.get('/products', { params: { legacyId, limit: 1 } })
  const match = data.items[0]
  return match ? normalize(match) : null
}
