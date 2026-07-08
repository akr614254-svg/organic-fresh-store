import crypto from 'crypto'
import asyncHandler from 'express-async-handler'
import razorpay from '../config/razorpay.js'
import Order from '../models/Order.js'

// @route  POST /api/orders/:id/pay
// @access Private (order owner)
// Creates a Razorpay order for the exact total we already computed
// server-side when the order was placed. The client never sets the amount.
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error('Not authorized for this order')
  }
  if (order.paymentMethod !== 'razorpay') {
    res.status(400)
    throw new Error('This order is not set up for online payment')
  }
  if (order.paymentStatus === 'paid') {
    res.status(400)
    throw new Error('This order has already been paid')
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.total * 100), // paise
    currency: 'INR',
    receipt: order.orderNumber,
  })

  order.razorpayOrderId = razorpayOrder.id
  await order.save()

  res.json({
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    orderNumber: order.orderNumber,
  })
})

// @route  POST /api/orders/:id/verify
// @access Private (order owner)
// Verifies the HMAC signature Razorpay returns after a successful checkout.
// This is the step that actually proves the payment happened — never trust
// a "success" callback on the client alone.
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

  const order = await Order.findById(req.params.id)
  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error('Not authorized for this order')
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    order.paymentStatus = 'failed'
    await order.save()
    res.status(400)
    throw new Error('Payment verification failed — signature mismatch')
  }

  order.paymentStatus = 'paid'
  order.razorpayPaymentId = razorpay_payment_id
  order.status = 'confirmed'
  await order.save()

  res.json(order)
})
