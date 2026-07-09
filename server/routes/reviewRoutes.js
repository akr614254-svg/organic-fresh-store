import express from 'express'
import { getProductReviews, upsertReview, deleteOwnReview } from '../controllers/reviewController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/:productId', getProductReviews)
router.post('/:productId', protect, upsertReview)
router.delete('/:productId', protect, deleteOwnReview)

export default router
