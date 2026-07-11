import express from 'express'
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateOrderPaymentStatus,
  cancelOrder,
  requestReturn,
  resolveReturn,
  downloadInvoice,
  getSlotAvailability,
} from '../controllers/orderController.js'
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/paymentController.js'
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js'

const router = express.Router()

// optionalAuth (not protect) on these three — guest checkout is allowed,
// but a logged-in user's identity is still attached when a token is sent.
router.post('/', optionalAuth, createOrder)
router.get('/mine', protect, getMyOrders)
router.get('/slots', getSlotAvailability)

// Razorpay — create a gateway order for an existing order, then verify the
// payment signature once checkout completes on the client.
router.post('/:id/pay', optionalAuth, createRazorpayOrder)
router.post('/:id/verify', optionalAuth, verifyRazorpayPayment)

// Customer self-service — cancel (early stage only) and return requests
// (post-delivery). Both check ownership inside the controller.
router.put('/:id/cancel', protect, cancelOrder)
router.put('/:id/return', protect, requestReturn)

router.get('/:id', protect, getOrderById)
router.get('/:id/invoice', protect, downloadInvoice)

// Admin order management — full dashboard UI lands alongside these routes
router.get('/', protect, adminOnly, getAllOrders)
router.put('/:id/status', protect, adminOnly, updateOrderStatus)
router.put('/:id/payment-status', protect, adminOnly, updateOrderPaymentStatus)
router.put('/:id/return/resolve', protect, adminOnly, resolveReturn)

export default router
