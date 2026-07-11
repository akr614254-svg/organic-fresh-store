import api from './api'

export async function fetchServerCart() {
  const { data } = await api.get('/cart')
  return data.items
}

export async function syncServerCart(items) {
  await api.put('/cart', { items })
}

export async function clearServerCart() {
  await api.delete('/cart')
}
