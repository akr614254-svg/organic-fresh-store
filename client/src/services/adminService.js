import api from './api'

export async function fetchStats() {
  const { data } = await api.get('/admin/stats')
  return data
}

export async function fetchAdminProducts({ search = '', category = 'all' } = {}) {
  const { data } = await api.get('/products', {
    params: { includeInactive: true, search: search || undefined, category },
  })
  return data.items
}

export async function createAdminProduct(payload) {
  const { data } = await api.post('/products', payload)
  return data
}

export async function updateAdminProduct(id, payload) {
  const { data } = await api.put(`/products/${id}`, payload)
  return data
}

export async function deleteAdminProduct(id) {
  const { data } = await api.delete(`/products/${id}`)
  return data
}

export async function fetchAllOrders() {
  const { data } = await api.get('/orders')
  return data
}

export async function updateOrderStatus(id, status) {
  const { data } = await api.put(`/orders/${id}/status`, { status })
  return data
}

export async function updateOrderPaymentStatus(id, paymentStatus) {
  const { data } = await api.put(`/orders/${id}/payment-status`, { paymentStatus })
  return data
}

export async function resolveReturn(id, approve, scheduledFor) {
  const { data } = await api.put(`/orders/${id}/return/resolve`, { approve, scheduledFor })
  return data
}

export async function processRefundsNow() {
  const { data } = await api.post('/admin/refunds/process')
  return data
}

export async function fetchUsers() {
  const { data } = await api.get('/admin/users')
  return data
}

export async function updateUserRole(id, role) {
  const { data } = await api.put(`/admin/users/${id}/role`, { role })
  return data
}

export async function fetchCoupons() {
  const { data } = await api.get('/coupons')
  return data
}

export async function createCoupon(payload) {
  const { data } = await api.post('/coupons', payload)
  return data
}

export async function updateCoupon(id, payload) {
  const { data } = await api.put(`/coupons/${id}`, payload)
  return data
}

export async function deleteCoupon(id) {
  const { data } = await api.delete(`/coupons/${id}`)
  return data
}
