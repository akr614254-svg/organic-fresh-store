import Coupon from '../models/Coupon.js'

/**
 * Validates a coupon code against a subtotal and returns the coupon
 * document plus the exact discount to apply. Throws a plain Error with a
 * user-facing message on any failure — callers turn that into a 400.
 *
 * Always re-run this server-side at order creation, even if the client
 * already called /coupons/validate — never trust a discount amount that
 * arrives from the browser.
 */
export async function validateCouponForOrder(code, subtotal) {
  if (!code) return null

  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() })
  if (!coupon) throw new Error('Invalid coupon code')
  if (!coupon.isActive) throw new Error('This coupon is no longer active')
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new Error('This coupon has expired')
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw new Error('This coupon has reached its usage limit')
  }
  if (subtotal < coupon.minOrderValue) {
    throw new Error(`Add ₹${Math.ceil(coupon.minOrderValue - subtotal)} more to use this coupon (min order ₹${coupon.minOrderValue})`)
  }

  let discountAmount = coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value
  if (coupon.maxDiscount != null) discountAmount = Math.min(discountAmount, coupon.maxDiscount)
  discountAmount = Math.min(discountAmount, subtotal) // never discount past ₹0
  discountAmount = Math.round(discountAmount)

  return { coupon, discountAmount }
}
