import 'dotenv/config'
import http from 'http'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'

import connectDB from './config/db.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'
import { initSocket } from './utils/socket.js'

import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import pushRoutes from './routes/pushRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import couponRoutes from './routes/couponRoutes.js'
import { processDueScheduledRefunds } from './utils/refunds.js'
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js'

await connectDB()

const app = express()

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')
app.use(helmet())
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use(mongoSanitize()) // strips $ / . operators from req.body/query/params — blocks NoSQL injection
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'organic-fresh-api' }))

app.use('/api', apiLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/push', pushRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/coupons', couponRoutes)

app.use(notFound)
app.use(errorHandler)

const httpServer = http.createServer(app)
initSocket(httpServer, allowedOrigins)

// Best-effort background check for due scheduled refunds. This only fires
// while the server is actually awake — on Render's free tier the service
// sleeps after 15 minutes idle, so this isn't a guaranteed-on-time cron.
// The admin "process refunds now" button (POST /api/admin/refunds/process)
// is the reliable fallback for exact timing.
const REFUND_CHECK_INTERVAL_MS = 10 * 60 * 1000 // 10 minutes
setInterval(() => {
  processDueScheduledRefunds().catch((err) => console.error('[refund] Background check failed:', err.message))
}, REFUND_CHECK_INTERVAL_MS)

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => console.log(`Organic Fresh API running on port ${PORT}`))
