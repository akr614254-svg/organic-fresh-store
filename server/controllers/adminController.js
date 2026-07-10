import asyncHandler from 'express-async-handler'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import { processDueScheduledRefunds } from '../utils/refunds.js'

// @route  GET /api/admin/stats
// @access Private/Admin
export const getStats = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const [totalOrders, totalProducts, totalUsers, paidOrders, salesByDay, recentOrders] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments(),
    Order.find({ paymentStatus: 'paid' }).select('total').lean(),
    Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
  ])

  // Cash-on-delivery orders count toward "orders placed" revenue too, so the
  // dashboard reflects total order value rather than only verified payments.
  const allOrders = await Order.find().select('total').lean()
  const totalSales = allOrders.reduce((sum, o) => sum + o.total, 0)

  res.json({
    totalOrders,
    totalProducts,
    totalUsers,
    totalSales,
    verifiedPayments: paidOrders.length,
    salesByDay: salesByDay.map((d) => ({ date: d._id, total: d.total, orders: d.orders })),
    recentOrders,
  })
})

// @route  GET /api/admin/users
// @access Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 })
  res.json(users)
})

// @route  PUT /api/admin/users/:id/role
// @access Private/Admin
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body
  if (!['customer', 'admin'].includes(role)) {
    res.status(400)
    throw new Error('Role must be "customer" or "admin"')
  }

  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  user.role = role
  await user.save()
  res.json({ user: user.toSafeObject() })
})

// @route  POST /api/admin/refunds/process
// @access Private/Admin
// Manually kicks off any scheduled refunds whose date has passed. There's
// also a background timer doing this automatically (see server.js), but
// Render's free tier sleeps the server after inactivity, so a manual
// "process now" button is a reliable fallback rather than a nice-to-have.
export const processRefundsNow = asyncHandler(async (req, res) => {
  const processed = await processDueScheduledRefunds()
  res.json({ processed: processed.length, orders: processed })
})
