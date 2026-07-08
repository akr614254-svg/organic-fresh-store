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
