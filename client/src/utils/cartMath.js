export const DELIVERY_FEE = 25
export const FREE_DELIVERY_THRESHOLD = 300

// Caps a quantity at available stock. `stock == null` means "unknown /
// unlimited" (e.g. a cart item saved before stock tracking existed), so it
// isn't capped at all.
export function clampQty(qty, stock) {
  const cap = stock ?? Infinity
  return Math.min(qty, cap)
}

// Cart-wide totals: item count, subtotal, delivery fee, grand total.
export function calcCartTotals(items) {
  const totalItems = items.reduce((sum, i) => sum + i.qty, 0)
  const subtotal = items.reduce((sum, i) => sum + i.qty * i.price, 0)
  const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const total = subtotal + deliveryFee
  return { totalItems, subtotal, deliveryFee, total }
}
