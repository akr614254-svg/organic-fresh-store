import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    // Matches the numeric ids in client/src/data/vegetables.js (same
    // legacyId used by Product/Order), so reviews work without needing
    // the storefront's static catalog to be migrated into the DB.
    product: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true }, // denormalized so we don't need to populate on every read
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '' },
  },
  { timestamps: true },
)

// One review per user per product — posting again edits their existing one.
reviewSchema.index({ product: 1, user: 1 }, { unique: true })

export default mongoose.model('Review', reviewSchema)
