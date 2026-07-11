import { describe, it, expect } from 'vitest'
import { evaluateCoupon } from '../utils/couponMath.js'

const baseCoupon = {
  code: 'SAVE50',
  type: 'flat',
  value: 50,
  minOrderValue: 0,
  maxDiscount: null,
  usageLimit: null,
  usedCount: 0,
  isActive: true,
  expiresAt: null,
}

describe('evaluateCoupon', () => {
  it('applies a flat discount as-is', () => {
    const discount = evaluateCoupon(baseCoupon, 200)
    expect(discount).toBe(50)
  })

  it('applies a percent discount as a share of the subtotal', () => {
    const coupon = { ...baseCoupon, type: 'percent', value: 10 }
    const discount = evaluateCoupon(coupon, 500)
    expect(discount).toBe(50) // 10% of 500
  })

  it('caps a percent discount at maxDiscount when set', () => {
    const coupon = { ...baseCoupon, type: 'percent', value: 50, maxDiscount: 40 }
    const discount = evaluateCoupon(coupon, 500) // 50% of 500 = 250, capped to 40
    expect(discount).toBe(40)
  })

  it('never discounts more than the subtotal itself', () => {
    const coupon = { ...baseCoupon, type: 'flat', value: 1000 }
    const discount = evaluateCoupon(coupon, 200)
    expect(discount).toBe(200)
  })

  it('rejects an inactive coupon', () => {
    const coupon = { ...baseCoupon, isActive: false }
    expect(() => evaluateCoupon(coupon, 200)).toThrow(/no longer active/i)
  })

  it('rejects an expired coupon', () => {
    const coupon = { ...baseCoupon, expiresAt: new Date('2020-01-01') }
    expect(() => evaluateCoupon(coupon, 200)).toThrow(/expired/i)
  })

  it('accepts a coupon that has not expired yet', () => {
    const coupon = { ...baseCoupon, expiresAt: new Date('2099-01-01') }
    expect(() => evaluateCoupon(coupon, 200)).not.toThrow()
  })

  it('rejects a coupon that has hit its usage limit', () => {
    const coupon = { ...baseCoupon, usageLimit: 5, usedCount: 5 }
    expect(() => evaluateCoupon(coupon, 200)).toThrow(/usage limit/i)
  })

  it('allows a coupon that is below its usage limit', () => {
    const coupon = { ...baseCoupon, usageLimit: 5, usedCount: 4 }
    expect(() => evaluateCoupon(coupon, 200)).not.toThrow()
  })

  it('rejects an order below the coupon minimum', () => {
    const coupon = { ...baseCoupon, minOrderValue: 300 }
    expect(() => evaluateCoupon(coupon, 200)).toThrow(/min order/i)
  })

  it('allows an order at or above the coupon minimum', () => {
    const coupon = { ...baseCoupon, minOrderValue: 300 }
    expect(() => evaluateCoupon(coupon, 300)).not.toThrow()
  })

  it('rounds the discount to the nearest rupee', () => {
    const coupon = { ...baseCoupon, type: 'percent', value: 33.333 }
    const discount = evaluateCoupon(coupon, 100)
    expect(Number.isInteger(discount)).toBe(true)
  })
})
