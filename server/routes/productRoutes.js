import express from 'express'
import {
  getProducts,
  getProductById,
  getFrequentlyBoughtTogether,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js'
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js'

const router = express.Router()

router.get('/', optionalAuth, getProducts)
// Must come before /:id so "legacy" isn't parsed as a Mongo _id.
router.get('/legacy/:legacyId/frequently-bought-together', getFrequentlyBoughtTogether)
router.get('/:id', getProductById)

// Admin-only writes — used by the /admin/products dashboard UI
router.post('/', protect, adminOnly, createProduct)
router.put('/:id', protect, adminOnly, updateProduct)
router.delete('/:id', protect, adminOnly, deleteProduct)

export default router
