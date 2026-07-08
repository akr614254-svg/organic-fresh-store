import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

let io

/**
 * Sets up a Socket.io server on top of the existing HTTP server, exposing
 * an /admin namespace that only authenticated admin users can join. Any
 * connected client's socket lands in the "admins" room, which is how we
 * broadcast "a new order landed" without polling.
 */
export function initSocket(httpServer, allowedOrigins) {
  io = new Server(httpServer, {
    cors: { origin: allowedOrigins, credentials: true },
  })

  const adminNamespace = io.of('/admin')

  // Reuse the same JWT used for REST auth — the client passes it via
  // socket.io's `auth` option instead of an Authorization header.
  adminNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) return next(new Error('No token provided'))

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id)
      if (!user || user.role !== 'admin') {
        return next(new Error('Admin access required'))
      }
      socket.user = user
      next()
    } catch {
      next(new Error('Invalid or expired token'))
    }
  })

  adminNamespace.on('connection', (socket) => {
    socket.join('admins')
    socket.on('disconnect', () => {})
  })

  return io
}

// Called from the order controller right after a new order is saved.
// Safe to call even if sockets haven't been initialised (e.g. in tests).
export function emitNewOrder(order) {
  if (!io) return
  io.of('/admin').to('admins').emit('new-order', {
    _id: order._id,
    orderNumber: order.orderNumber,
    total: order.total,
    deliveryAddress: order.deliveryAddress,
    createdAt: order.createdAt,
  })
}
