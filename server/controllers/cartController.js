import asyncHandler from 'express-async-handler'
import Cart from '../models/Cart.js'

// @route  GET /api/cart
// @access Private
// Lets the client pull down a cart saved from another device/session — used
// on login when the browser's own in-memory cart is empty.
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
  res.json({ items: cart?.items || [] })
})

// @route  PUT /api/cart
// @access Private
// Upserts the whole cart snapshot. Called by the client on a short debounce
// whenever the in-memory cart changes, so a signed-in customer's cart
// survives closing the tab — and so the abandoned-cart job below has
// something to look at.
export const syncCart = asyncHandler(async (req, res) => {
  const { items } = req.body
  if (!Array.isArray(items)) {
    res.status(400)
    throw new Error('items must be an array')
  }

  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      items: items.map((i) => ({
        legacyId: i.id,
        name: i.name,
        price: i.price,
        unit: i.unit,
        emoji: i.emoji,
        qty: i.qty,
      })),
      // Any real activity resets the reminder clock — a fresh "abandoned"
      // window starts from this update, not the original one.
      reminderSentAt: null,
    },
    { upsert: true, new: true }
  )
  res.json({ items: cart.items })
})

// @route  DELETE /api/cart
// @access Private
// Called right after a successful order (or a manual "clear cart") so an
// already-purchased cart never triggers an abandoned-cart reminder later.
export const clearServerCart = asyncHandler(async (req, res) => {
  await Cart.deleteOne({ user: req.user._id })
  res.json({ message: 'Cart cleared' })
})
