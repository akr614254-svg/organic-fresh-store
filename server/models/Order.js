import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    // Mirrors the product catalog's legacyId at the time of purchase, so
    // "Buy again" can re-add items to the cart without a lookup — and still
    // works even if the product is later deleted or deactivated.
    legacyId: { type: Number },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    emoji: { type: String, default: '🥬' },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], required: true, validate: (v) => v.length > 0 },

    deliveryAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      // Populated when the customer picks their address via the Google
      // Places autocomplete + map pin on Checkout. Optional so orders
      // placed without Maps configured (or with JS disabled) still work.
      lat: { type: Number },
      lng: { type: Number },
    },
    deliverySlot: { type: String, required: true },
    // Customer-chosen delivery date (not just a same-day time slot).
    // Defaults to "today" server-side if the client ever omits it.
    deliveryDate: { type: Date, required: true },

    subtotal: { type: Number, required: true },
    coupon: {
      code: { type: String },
      discountAmount: { type: Number, default: 0 },
    },
    // GST breakdown on the post-discount taxable amount. Split evenly across
    // CGST + SGST per standard intra-state Indian tax presentation.
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    deliveryFee: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },

    paymentMethod: { type: String, enum: ['razorpay', 'cod'], default: 'cod' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },

    status: {
      type: String,
      enum: ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed',
    },
    // Set automatically the moment status first becomes 'delivered' — this
    // is what the 1-day return window is measured from, not createdAt.
    deliveredAt: { type: Date },

    // Self-service return/refund request, raised by the customer within 24
    // hours of delivery and resolved by an admin. Approving a return on a
    // paid Razorpay order can trigger an automatic refund (immediate or
    // scheduled for a later date) — see server/utils/refunds.js.
    returnRequest: {
      status: { type: String, enum: ['none', 'requested', 'approved', 'rejected'], default: 'none' },
      reason: { type: String, default: '' },
      requestedAt: { type: Date },
      resolvedAt: { type: Date },
      refund: {
        status: {
          type: String,
          enum: ['none', 'scheduled', 'processing', 'completed', 'failed'],
          default: 'none',
        },
        amount: { type: Number },
        scheduledFor: { type: Date },
        razorpayRefundId: { type: String },
        processedAt: { type: Date },
        failureReason: { type: String },
      },
    },
  },
  { timestamps: true }
)

export default mongoose.model('Order', orderSchema)
