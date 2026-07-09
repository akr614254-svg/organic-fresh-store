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
} from '../controllers/orderController.js'
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/paymentController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

router.post('/', protect, createOrder)
router.get('/mine', protect, getMyOrders)

// Razorpay — create a gateway order for an existing order, then verify the
// payment signature once checkout completes on the client.
router.post('/:id/pay', protect, createRazorpayOrder)
router.post('/:id/verify', protect, verifyRazorpayPayment)

// Customer self-service — cancel (early stage only) and return requests
// (post-delivery). Both check ownership inside the controller.
router.put('/:id/cancel', protect, cancelOrder)
router.put('/:id/return', protect, requestReturn)

router.get('/:id', protect, getOrderById)

// Admin order management — full dashboard UI lands alongside these routes
router.get('/', protect, adminOnly, getAllOrders)
router.put('/:id/status', protect, adminOnly, updateOrderStatus)
router.put('/:id/payment-status', protect, adminOnly, updateOrderPaymentStatus)
router.put('/:id/return/resolve', protect, adminOnly, resolveReturn)

export default router
