import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema(
  {
    legacyId: { type: Number, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    emoji: { type: String, default: '🥬' },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
)

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: { type: [cartItemSchema], default: [] },
    // Set the moment a reminder push/email actually goes out, so the
    // abandoned-cart job never nags the same cart twice in a row. Cleared
    // back to null whenever the cart is touched again (see cartController).
    reminderSentAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export default mongoose.model('Cart', cartSchema)
