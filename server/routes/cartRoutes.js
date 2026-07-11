import express from 'express'
import { getCart, syncCart, clearServerCart } from '../controllers/cartController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/', protect, getCart)
router.put('/', protect, syncCart)
router.delete('/', protect, clearServerCart)

export default router
