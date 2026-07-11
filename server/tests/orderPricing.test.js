import { describe, it, expect } from 'vitest'
import { computeOrderPricing, GST_RATE, FREE_DELIVERY_THRESHOLD, DELIVERY_FEE } from '../utils/orderPricing.js'

describe('computeOrderPricing', () => {
  it('charges delivery fee below the free-delivery threshold', () => {
    const result = computeOrderPricing({ subtotal: 200 })
    expect(result.deliveryFee).toBe(DELIVERY_FEE)
  })

  it('gives free delivery at or above the threshold', () => {
    const result = computeOrderPricing({ subtotal: FREE_DELIVERY_THRESHOLD })
    expect(result.deliveryFee).toBe(0)
  })

  it('gives free delivery on an empty (zero-value) cart', () => {
    const result = computeOrderPricing({ subtotal: 0 })
    expect(result.deliveryFee).toBe(0)
    expect(result.total).toBe(0)
  })

  it('computes CGST and SGST as equal halves of the GST rate on the taxable amount', () => {
    const result = computeOrderPricing({ subtotal: 400 })
    const expectedEach = Math.round(400 * GST_RATE)
    expect(result.cgst).toBe(expectedEach)
    expect(result.sgst).toBe(expectedEach)
  })

  it('taxes the post-discount amount, not the raw subtotal', () => {
    const withDiscount = computeOrderPricing({ subtotal: 400, discountAmount: 100 })
    const withoutDiscount = computeOrderPricing({ subtotal: 400 })
    expect(withDiscount.cgst).toBeLessThan(withoutDiscount.cgst)
  })

  it('never lets a discount larger than the subtotal push the taxable amount negative', () => {
    const result = computeOrderPricing({ subtotal: 100, discountAmount: 500 })
    expect(result.taxableAmount).toBe(0)
    expect(result.total).toBeGreaterThanOrEqual(0)
  })

  it('adds subtotal + tax + delivery into the gross total before any wallet deduction', () => {
    const result = computeOrderPricing({ subtotal: 200 })
    expect(result.grossTotal).toBe(200 + result.cgst + result.sgst + DELIVERY_FEE)
  })

  it('deducts wallet balance from the total when useWallet is true', () => {
    const result = computeOrderPricing({ subtotal: 200, walletBalance: 50, useWallet: true })
    expect(result.walletAmountUsed).toBe(50)
    expect(result.total).toBe(result.grossTotal - 50)
  })

  it('ignores wallet balance when useWallet is false, even if a balance is passed', () => {
    const result = computeOrderPricing({ subtotal: 200, walletBalance: 999, useWallet: false })
    expect(result.walletAmountUsed).toBe(0)
    expect(result.total).toBe(result.grossTotal)
  })

  it('caps wallet usage at the gross total — never lets total go negative', () => {
    const result = computeOrderPricing({ subtotal: 200, walletBalance: 100000, useWallet: true })
    expect(result.walletAmountUsed).toBe(result.grossTotal)
    expect(result.total).toBe(0)
  })

  it('flags an order as fully covered by wallet only when the wallet paid the whole total', () => {
    const fullyCovered = computeOrderPricing({ subtotal: 200, walletBalance: 100000, useWallet: true })
    expect(fullyCovered.fullyCoveredByWallet).toBe(true)

    const partiallyCovered = computeOrderPricing({ subtotal: 200, walletBalance: 10, useWallet: true })
    expect(partiallyCovered.fullyCoveredByWallet).toBe(false)

    const noWallet = computeOrderPricing({ subtotal: 200 })
    expect(noWallet.fullyCoveredByWallet).toBe(false)
  })
})
