import express from 'express'
import { getStats, getUsers, updateUserRole, processRefundsNow } from '../controllers/adminController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

router.use(protect, adminOnly)

router.get('/stats', getStats)
router.get('/users', getUsers)
router.put('/users/:id/role', updateUserRole)
router.post('/refunds/process', processRefundsNow)

export default router
