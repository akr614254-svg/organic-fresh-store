import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percent', 'flat'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0 },
    // Caps the discount for percent-type coupons (e.g. "20% off, up to ₹100").
    // Ignored for flat coupons.
    maxDiscount: { type: Number, default: null },
    expiresAt: { type: Date, default: null },
    // null = unlimited uses across all customers
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default mongoose.model('Coupon', couponSchema)
