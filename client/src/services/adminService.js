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

export async function resolveReturn(id, approve) {
  const { data } = await api.put(`/orders/${id}/return/resolve`, { approve })
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
