import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    // Matches the numeric ids in client/src/data/vegetables.js, so the
    // existing cart/wishlist/product pages (built on those local ids)
    // can talk to this API without a client-side data model rewrite.
    legacyId: { type: Number, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['leafy', 'root', 'fruits', 'herbs'],
    },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, default: '500 g' },
    emoji: { type: String, default: '🥬' },
    imageUrl: { type: String, default: '' }, // Cloudinary URL, wired up alongside admin uploads
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    badge: { type: String, default: null },
    desc: { type: String, default: '' },
    stock: { type: Number, default: 100, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

productSchema.index({ name: 'text', desc: 'text' })

export default mongoose.model('Product', productSchema)
