import Coupon from '../models/Coupon.js'
import { evaluateCoupon } from './couponMath.js'

/**
 * Looks up a coupon by code and validates it against a subtotal, returning
 * the coupon document plus the exact discount to apply. Throws a plain
 * Error with a user-facing message on any failure — callers turn that into
 * a 400.
 *
 * Always re-run this server-side at order creation, even if the client
 * already called /coupons/validate — never trust a discount amount that
 * arrives from the browser.
 */
export async function validateCouponForOrder(code, subtotal) {
  if (!code) return null

  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() })
  if (!coupon) throw new Error('Invalid coupon code')

  const discountAmount = evaluateCoupon(coupon, subtotal)
  return { coupon, discountAmount }
}
