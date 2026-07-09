import asyncHandler from 'express-async-handler'
import PushSubscription from '../models/PushSubscription.js'

// @route  POST /api/push/subscribe
// @access Private
export const subscribe = asyncHandler(async (req, res) => {
  const { endpoint, keys } = req.body
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    res.status(400)
    throw new Error('Invalid push subscription payload')
  }

  // Upsert — if this exact browser/device already has a row (e.g. they
  // re-enabled notifications), just make sure it points at this user.
  await PushSubscription.findOneAndUpdate(
    { endpoint },
    { user: req.user._id, endpoint, keys },
    { upsert: true, new: true },
  )

  res.status(201).json({ subscribed: true })
})

// @route  POST /api/push/unsubscribe
// @access Private
export const unsubscribe = asyncHandler(async (req, res) => {
  const { endpoint } = req.body
  if (endpoint) {
    await PushSubscription.deleteOne({ endpoint, user: req.user._id })
  }
  res.json({ subscribed: false })
})
