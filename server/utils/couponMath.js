/**
 * Validates a coupon (already fetched from the DB) against a subtotal and
 * returns the ₹ discount to apply. Throws a plain Error with a user-facing
 * message on any failure — callers turn that into a 400.
 *
 * Kept separate from the DB lookup (see coupons.js) specifically so this
 * math is unit-testable without a database.
 */
export function evaluateCoupon(coupon, subtotal, now = new Date()) {
  if (!coupon.isActive) throw new Error('This coupon is no longer active')
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) throw new Error('This coupon has expired')
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw new Error('This coupon has reached its usage limit')
  }
  if (subtotal < coupon.minOrderValue) {
    throw new Error(
      `Add ₹${Math.ceil(coupon.minOrderValue - subtotal)} more to use this coupon (min order ₹${coupon.minOrderValue})`
    )
  }

  let discountAmount = coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value
  if (coupon.maxDiscount != null) discountAmount = Math.min(discountAmount, coupon.maxDiscount)
  discountAmount = Math.min(discountAmount, subtotal) // never discount past ₹0
  return Math.round(discountAmount)
}
