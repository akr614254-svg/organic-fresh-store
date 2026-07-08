import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from '../config/db.js'
import User from '../models/User.js'

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@organicfresh.test'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin123456'

async function seedAdmin() {
  await connectDB()

  const existing = await User.findOne({ email: ADMIN_EMAIL })
  if (existing) {
    existing.role = 'admin'
    await existing.save()
    console.log(`Existing user ${ADMIN_EMAIL} promoted to admin.`)
  } else {
    await User.create({
      name: 'Store Admin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
    })
    console.log(`Admin account created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
    console.log('Change this password after first login.')
  }

  await mongoose.disconnect()
  process.exit(0)
}

seedAdmin().catch((err) => {
  console.error(err)
  process.exit(1)
})
