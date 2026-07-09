import asyncHandler from 'express-async-handler'
import Review from '../models/Review.js'

// @route  GET /api/reviews/:productId
// @access Public
export const getProductReviews = asyncHandler(async (req, res) => {
  const productId = Number(req.params.productId)

  const [reviews, agg] = await Promise.all([
    Review.find({ product: productId }).sort({ createdAt: -1 }),
    Review.aggregate([
      { $match: { product: productId } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
  ])

  const summary = agg[0]
    ? { avgRating: Math.round(agg[0].avgRating * 10) / 10, count: agg[0].count }
    : { avgRating: null, count: 0 }

  res.json({ reviews, summary })
})

// @route  POST /api/reviews/:productId
// @access Private
// Upsert — submitting again just edits the same person's existing review
// for this product rather than creating a duplicate.
export const upsertReview = asyncHandler(async (req, res) => {
  const productId = Number(req.params.productId)
  const { rating, comment } = req.body

  if (!rating || rating < 1 || rating > 5) {
    res.status(400)
    throw new Error('Rating must be between 1 and 5')
  }

  const review = await Review.findOneAndUpdate(
    { product: productId, user: req.user._id },
    { product: productId, user: req.user._id, userName: req.user.name, rating, comment: comment || '' },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )

  res.status(201).json(review)
})

// @route  DELETE /api/reviews/:productId
// @access Private — only your own review
export const deleteOwnReview = asyncHandler(async (req, res) => {
  const productId = Number(req.params.productId)
  await Review.deleteOne({ product: productId, user: req.user._id })
  res.json({ deleted: true })
})
