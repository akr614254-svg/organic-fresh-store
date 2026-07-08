import asyncHandler from 'express-async-handler'
import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'

// @route  POST /api/auth/register
// @access Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body

  if (!name || !email || !password) {
    res.status(400)
    throw new Error('Name, email, and password are all required')
  }

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) {
    res.status(409)
    throw new Error('An account with that email already exists')
  }

  const user = await User.create({ name, email, password, phone })

  res.status(201).json({
    user: user.toSafeObject(),
    token: generateToken(user._id),
  })
})

// @route  POST /api/auth/login
// @access Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400)
    throw new Error('Email and password are required')
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
  if (!user || !(await user.matchPassword(password))) {
    res.status(401)
    throw new Error('Invalid email or password')
  }

  res.json({
    user: user.toSafeObject(),
    token: generateToken(user._id),
  })
})

// @route  GET /api/auth/me
// @access Private
export const getProfile = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeObject() })
})

// @route  PUT /api/auth/me
// @access Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, addresses } = req.body

  if (name !== undefined) req.user.name = name
  if (phone !== undefined) req.user.phone = phone
  if (addresses !== undefined) req.user.addresses = addresses

  const updated = await req.user.save()
  res.json({ user: updated.toSafeObject() })
})
