import api from './api'

export async function placeOrder({ items, deliveryAddress, deliverySlot, paymentMethod }) {
  const { data } = await api.post('/orders', { items, deliveryAddress, deliverySlot, paymentMethod })
  return data
}

export async function fetchMyOrders() {
  const { data } = await api.get('/orders/mine')
  return data
}

export async function fetchOrderById(id) {
  const { data } = await api.get(`/orders/${id}`)
  return data
}

export async function cancelOrder(id) {
  const { data } = await api.put(`/orders/${id}/cancel`)
  return data
}

export async function requestReturn(id, reason) {
  const { data } = await api.put(`/orders/${id}/return`, { reason })
  return data
}
