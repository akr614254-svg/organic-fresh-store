import api from './api'

export async function createRazorpayOrder(orderId) {
  const { data } = await api.post(`/orders/${orderId}/pay`)
  return data
}

export async function verifyRazorpayPayment(orderId, payload) {
  const { data } = await api.post(`/orders/${orderId}/verify`, payload)
  return data
}

/**
 * Opens the Razorpay checkout modal and resolves once the user completes
 * (or abandons) payment. Resolves with the verified order on success,
 * rejects with an Error otherwise.
 */
export function openRazorpayCheckout({ orderId, gateway, customer }) {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error('Razorpay checkout script failed to load. Check your connection and try again.'))
      return
    }

    const rzp = new window.Razorpay({
      key: gateway.keyId,
      amount: gateway.amount,
      currency: gateway.currency,
      name: 'Organic Fresh',
      description: `Order ${gateway.orderNumber}`,
      order_id: gateway.razorpayOrderId,
      prefill: {
        name: customer.name,
        contact: customer.phone,
      },
      theme: { color: '#1B4332' },
      handler: async (response) => {
        try {
          const verified = await verifyRazorpayPayment(orderId, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
          resolve(verified)
        } catch (err) {
          reject(err)
        }
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled.')),
      },
    })

    rzp.on('payment.failed', (response) => {
      reject(new Error(response.error?.description || 'Payment failed.'))
    })

    rzp.open()
  })
}
