import express from 'express'
import { registerUser, loginUser, getProfile, updateProfile } from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me', protect, getProfile)
router.put('/me', protect, updateProfile)

export default router
