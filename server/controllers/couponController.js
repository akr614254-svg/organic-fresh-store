import asyncHandler from 'express-async-handler'
import Coupon from '../models/Coupon.js'
import { validateCouponForOrder } from '../utils/coupons.js'

// @route  POST /api/coupons/validate
// @access Private — any logged-in customer, checked again for real at checkout
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body
  if (!code || typeof subtotal !== 'number') {
    res.status(400)
    throw new Error('A coupon code and subtotal are required')
  }

  const result = await validateCouponForOrder(code, subtotal)
  res.json({
    code: result.coupon.code,
    type: result.coupon.type,
    value: result.coupon.value,
    discountAmount: result.discountAmount,
  })
})

// @route  GET /api/coupons
// @access Private/Admin
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 })
  res.json(coupons)
})

// @route  POST /api/coupons
// @access Private/Admin
export const createCoupon = asyncHandler(async (req, res) => {
  const { code, type, value, minOrderValue, maxDiscount, expiresAt, usageLimit, isActive } = req.body

  const existing = await Coupon.findOne({ code: code?.trim().toUpperCase() })
  if (existing) {
    res.status(409)
    throw new Error(`Coupon code "${code}" already exists`)
  }

  const coupon = await Coupon.create({
    code,
    type,
    value,
    minOrderValue: minOrderValue || 0,
    maxDiscount: maxDiscount || null,
    expiresAt: expiresAt || null,
    usageLimit: usageLimit || null,
    isActive: isActive !== undefined ? isActive : true,
  })
  res.status(201).json(coupon)
})

// @route  PUT /api/coupons/:id
// @access Private/Admin
export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  if (!coupon) {
    res.status(404)
    throw new Error('Coupon not found')
  }
  res.json(coupon)
})

// @route  DELETE /api/coupons/:id
// @access Private/Admin
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id)
  if (!coupon) {
    res.status(404)
    throw new Error('Coupon not found')
  }
  res.json({ message: 'Coupon deleted' })
})
