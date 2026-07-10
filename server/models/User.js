import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    line: { type: String, required: true },
    phone: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: false }
)

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, trim: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    addresses: [addressSchema],
    // Store credit — the automatic fallback refund method for orders that
    // can't be refunded to a real online payment (COD, or a Razorpay order
    // with no actual payment record). Customers can spend this at checkout
    // like a discount. See server/utils/refunds.js and orderController.js.
    walletBalance: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
)

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    addresses: this.addresses,
    walletBalance: this.walletBalance,
  }
}

export default mongoose.model('User', userSchema)
