export const GST_RATE = 0.025 // 2.5% CGST + 2.5% SGST = 5% total, split evenly
export const FREE_DELIVERY_THRESHOLD = 300
export const DELIVERY_FEE = 25

/**
 * Pure pricing math for an order: subtotal → tax → delivery fee → wallet →
 * final total. Deliberately takes plain numbers rather than DB documents,
 * so it can be unit tested without touching MongoDB, and so the exact same
 * function backs both order creation and anything that needs to preview a
 * total (e.g. a future "order summary" endpoint).
 */
export function computeOrderPricing({ subtotal, discountAmount = 0, walletBalance = 0, useWallet = false }) {
  const taxableAmount = Math.max(subtotal - discountAmount, 0)
  const cgst = Math.round(taxableAmount * GST_RATE)
  const sgst = Math.round(taxableAmount * GST_RATE)

  // Free-delivery threshold is based on cart value before any discount —
  // matches how most grocery apps present it.
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE
  const grossTotal = taxableAmount + cgst + sgst + deliveryFee

  let walletAmountUsed = 0
  if (useWallet && walletBalance > 0) {
    walletAmountUsed = Math.min(walletBalance, grossTotal)
  }
  const total = grossTotal - walletAmountUsed
  const fullyCoveredByWallet = total <= 0 && walletAmountUsed > 0

  return { taxableAmount, cgst, sgst, deliveryFee, grossTotal, walletAmountUsed, total, fullyCoveredByWallet }
}
