import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from '../config/db.js'
import Coupon from '../models/Coupon.js'

const coupons = [
  {
    code: 'WELCOME50',
    type: 'flat',
    value: 50,
    minOrderValue: 200,
    usageLimit: null,
    isActive: true,
  },
  {
    code: 'FRESH10',
    type: 'percent',
    value: 10,
    minOrderValue: 150,
    maxDiscount: 75,
    usageLimit: null,
    isActive: true,
  },
  {
    code: 'BIGBASKET20',
    type: 'percent',
    value: 20,
    minOrderValue: 500,
    maxDiscount: 150,
    usageLimit: 100,
    isActive: true,
  },
]

async function seedCoupons() {
  await connectDB()

  for (const c of coupons) {
    await Coupon.findOneAndUpdate({ code: c.code }, c, { upsert: true, new: true })
  }

  console.log(`Seeded ${coupons.length} coupons: ${coupons.map((c) => c.code).join(', ')}`)
  await mongoose.disconnect()
  process.exit(0)
}

seedCoupons().catch((err) => {
  console.error(err)
  process.exit(1)
})
