import api from './api'

export async function validateCoupon(code, subtotal) {
  const { data } = await api.post('/coupons/validate', { code, subtotal })
  return data
}
