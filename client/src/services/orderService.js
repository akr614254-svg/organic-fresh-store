import api from './api'

export async function placeOrder({
  items,
  deliveryAddress,
  deliverySlot,
  deliveryDate,
  paymentMethod,
  couponCode,
  useWallet,
  guestEmail,
}) {
  const { data } = await api.post('/orders', {
    items,
    deliveryAddress,
    deliverySlot,
    deliveryDate,
    paymentMethod,
    couponCode,
    useWallet,
    guestEmail,
  })
  return data
}

// Per-slot capacity for a given date, so Checkout can disable a slot once
// it's full instead of letting the customer find out at submit time.
export async function fetchSlotAvailability(date) {
  const { data } = await api.get('/orders/slots', { params: { date } })
  return data.slots
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

// Invoice comes back as a raw PDF, not JSON, so this fetches it as a blob
// and triggers a browser download rather than returning parsed data.
export async function downloadInvoice(orderId, orderNumber) {
  const res = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `invoice-${orderNumber}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
