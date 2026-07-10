import 'dotenv/config'
import http from 'http'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'

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

await connectDB()

const app = express()

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())
app.use(cookieParser())
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'organic-fresh-api' }))

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

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => console.log(`Organic Fresh API running on port ${PORT}`))
