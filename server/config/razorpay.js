import Razorpay from 'razorpay'

let razorpay = null

// Razorpay is optional — a project without payment keys configured should
// still boot fine and serve everything except the "pay with Razorpay"
// checkout option. We only construct the client the first time it's
// actually needed, and throw a clear error at that point instead of
// crashing the whole server on startup.
export function getRazorpay() {
  if (razorpay) return razorpay

  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error(
      'Razorpay is not configured — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to accept online payments.',
    )
  }

  razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET })
  return razorpay
}

export default getRazorpay
