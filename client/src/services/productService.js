import api from './api'

// The API returns Mongo's `_id`. The rest of the app (cart, wishlist,
// product cards/pages) was built around a simple `id` field, so we
// normalize every product coming from the API to also carry `id`.
function normalize(product) {
  return { ...product, id: product._id }
}

// @desc   Fetch the live, active catalog from the API (replaces the old
//         static client/src/data/vegetables.js list, which never reflected
//         admin edits).
export async function fetchProducts({ category, search } = {}) {
  const { data } = await api.get('/products', {
    params: {
      category: category && category !== 'all' ? category : undefined,
      search: search || undefined,
      limit: 200,
    },
  })
  return data.items.map(normalize)
}

export async function fetchProductById(id) {
  const { data } = await api.get(`/products/${id}`)
  return normalize(data)
}
