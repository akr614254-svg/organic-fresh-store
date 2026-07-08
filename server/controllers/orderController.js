import asyncHandler from 'express-async-handler'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { emitNewOrder } from '../utils/socket.js'
import { notifyAdminsOfNewOrder } from '../utils/notify.js'

function generateOrderNumber() {
  return `OFS${Math.floor(100000 + Math.random() * 900000)}`
}

// @route  POST /api/orders
// @access Private
// Payment verification (Razorpay signature check) hooks into this flow in Phase 5.
// For now, COD orders are marked pending and Razorpay orders are marked paid
// once the client confirms a successful checkout.
export const createOrder = asyncHandler(async (req, res) => {
  const { items, deliveryAddress, deliverySlot, paymentMethod } = req.body

  if (!items || items.length === 0) {
    res.status(400)
    throw new Error('Cannot place an order with no items')
  }
  if (!deliveryAddress?.name || !deliveryAddress?.phone || !deliveryAddress?.address) {
    res.status(400)
    throw new Error('Delivery name, phone, and address are required')
  }

  // Re-price server-side from the database rather than trusting client totals.
  // Items arrive keyed by the cart's `id` (the client catalog's legacyId).
  const legacyIds = items.map((i) => i.id)
  const dbProducts = await Product.find({ legacyId: { $in: legacyIds } })
  const priceMap = new Map(dbProducts.map((p) => [p.legacyId, p]))

  const orderItems = items.map((i) => {
    const dbProduct = priceMap.get(i.id)
    if (!dbProduct) {
      res.status(400)
      throw new Error(`Product "${i.name || i.id}" is no longer available`)
    }
    return {
      product: dbProduct._id,
      name: dbProduct.name,
      price: dbProduct.price,
      unit: dbProduct.unit,
      emoji: dbProduct.emoji,
      qty: i.qty,
    }
  })

  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0)
  const deliveryFee = subtotal >= 300 || subtotal === 0 ? 0 : 25
  const total = subtotal + deliveryFee

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user._id,
    items: orderItems,
    deliveryAddress: {
      name: deliveryAddress.name,
      phone: deliveryAddress.phone,
      address: deliveryAddress.address,
      // Optional — only present when the customer picked their address
      // via the Google Maps autocomplete + pin on Checkout.
      lat: typeof deliveryAddress.lat === 'number' ? deliveryAddress.lat : undefined,
      lng: typeof deliveryAddress.lng === 'number' ? deliveryAddress.lng : undefined,
    },
    deliverySlot,
    subtotal,
    deliveryFee,
    total,
    paymentMethod: paymentMethod === 'razorpay' ? 'razorpay' : 'cod',
    paymentStatus: paymentMethod === 'razorpay' ? 'pending' : 'pending',
  })

  // Let any connected admin dashboards know a new order just landed —
  // powers the live badge instead of a 30s poll.
  emitNewOrder(order)

  // Also fire off a free email + Telegram alert. Both are best-effort and
  // never block or fail the order if not configured (see utils/notify.js).
  notifyAdminsOfNewOrder(order)

  res.status(201).json(order)
})

// @route  GET /api/orders/mine
// @access Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
  res.json(orders)
})

// @route  GET /api/orders/:id
// @access Private (owner or admin)
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }
  const isOwner = order.user.toString() === req.user._id.toString()
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403)
    throw new Error('Not authorized to view this order')
  }
  res.json(order)
})

// @route  GET /api/orders
// @access Private/Admin — powers the admin dashboard's order list
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email')
  res.json(orders)
})

// @route  PUT /api/orders/:id/status
// @access Private/Admin
const VALID_STATUSES = ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled']

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  if (!VALID_STATUSES.includes(status)) {
    res.status(400)
    throw new Error(`Status must be one of: ${VALID_STATUSES.join(', ')}`)
  }

  const order = await Order.findById(req.params.id)
  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }

  order.status = status
  await order.save()
  res.json(order)
})

// @route  PUT /api/orders/:id/payment-status
// @access Private/Admin
// Lets the admin mark a Cash-on-Delivery order as paid once cash is
// actually collected (Razorpay orders update this automatically on verify).
const VALID_PAYMENT_STATUSES = ['pending', 'paid', 'failed']

export const updateOrderPaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body
  if (!VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
    res.status(400)
    throw new Error(`Payment status must be one of: ${VALID_PAYMENT_STATUSES.join(', ')}`)
  }

  const order = await Order.findById(req.params.id)
  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }

  order.paymentStatus = paymentStatus
  await order.save()
  res.json(order)
})
