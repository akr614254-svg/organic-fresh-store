import express from 'express'
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js'
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js'

const router = express.Router()

router.get('/', optionalAuth, getProducts)
router.get('/:id', getProductById)

// Admin-only writes — used by the /admin/products dashboard UI
router.post('/', protect, adminOnly, createProduct)
router.put('/:id', protect, adminOnly, updateProduct)
router.delete('/:id', protect, adminOnly, deleteProduct)

export default router
