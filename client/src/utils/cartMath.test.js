import { describe, it, expect } from 'vitest'
import { clampQty, calcCartTotals, DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from './cartMath'

describe('clampQty', () => {
  it('allows any quantity when stock is unknown (null/undefined)', () => {
    expect(clampQty(50, undefined)).toBe(50)
    expect(clampQty(50, null)).toBe(50)
  })

  it('caps the quantity at available stock', () => {
    expect(clampQty(10, 3)).toBe(3)
  })

  it('leaves the quantity unchanged when under stock', () => {
    expect(clampQty(2, 5)).toBe(2)
  })

  it('caps at 0 when a product is out of stock', () => {
    expect(clampQty(1, 0)).toBe(0)
  })
})

describe('calcCartTotals', () => {
  it('returns all zeros for an empty cart', () => {
    const result = calcCartTotals([])
    expect(result).toEqual({ totalItems: 0, subtotal: 0, deliveryFee: 0, total: 0 })
  })

  it('sums quantities and price × quantity across items', () => {
    const items = [
      { price: 30, qty: 2 },
      { price: 45, qty: 1 },
    ]
    const result = calcCartTotals(items)
    expect(result.totalItems).toBe(3)
    expect(result.subtotal).toBe(30 * 2 + 45)
  })

  it('charges delivery fee below the free-delivery threshold', () => {
    const result = calcCartTotals([{ price: 100, qty: 1 }])
    expect(result.deliveryFee).toBe(DELIVERY_FEE)
    expect(result.total).toBe(100 + DELIVERY_FEE)
  })

  it('gives free delivery at or above the threshold', () => {
    const result = calcCartTotals([{ price: FREE_DELIVERY_THRESHOLD, qty: 1 }])
    expect(result.deliveryFee).toBe(0)
    expect(result.total).toBe(FREE_DELIVERY_THRESHOLD)
  })
})
