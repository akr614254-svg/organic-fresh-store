import asyncHandler from 'express-async-handler'
import Product from '../models/Product.js'

// @route  GET /api/products?category=leafy&search=palak&page=1&limit=20
// @access Public
export const getProducts = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 40, includeInactive } = req.query

  const filter = {}
  if (!(includeInactive === 'true' && req.user?.role === 'admin')) {
    filter.isActive = true
  }
  if (category && category !== 'all') filter.category = category
  if (search) filter.$text = { $search: search }

  const skip = (Number(page) - 1) * Number(limit)

  const [items, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter),
  ])

  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) })
})

// @route  GET /api/products/:id
// @access Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }
  res.json(product)
})

// @route  POST /api/products
// @access Private/Admin — imageUrl comes from the client's direct-to-Cloudinary upload
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body)
  res.status(201).json(product)
})

// @route  PUT /api/products/:id
// @access Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }
  Object.assign(product, req.body)
  const updated = await product.save()
  res.json(updated)
})

// @route  DELETE /api/products/:id
// @access Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }
  await product.deleteOne()
  res.json({ message: 'Product removed' })
})
