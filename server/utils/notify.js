import nodemailer from 'nodemailer'

// Both notifications are best-effort: if they're not configured (no env
// vars set) or the network call fails, we log a warning and move on —
// a missing email/Telegram alert should never stop an order from succeeding.

let transporter = null

function getTransporter() {
  if (transporter) return transporter
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
  return transporter
}

function orderSummaryText(order) {
  const itemLines = order.items
    .map((i) => `  • ${i.name} x${i.qty} — ₹${i.price * i.qty}`)
    .join('\n')
  return (
    `New order ${order.orderNumber}\n` +
    `Total: ₹${order.total}\n` +
    `Customer: ${order.deliveryAddress.name} (${order.deliveryAddress.phone})\n` +
    `Delivery slot: ${order.deliverySlot}\n` +
    `Address: ${order.deliveryAddress.address}\n\n` +
    `Items:\n${itemLines}`
  )
}

// Free plain-text email via any SMTP account — Gmail (with an app
// password) or a free-tier provider like Brevo/SendGrid all work the
// same way. Configure SMTP_HOST/PORT/USER/PASS + ADMIN_EMAIL in .env.
export async function sendOrderEmail(order) {
  const to = process.env.ADMIN_EMAIL
  const from = process.env.SMTP_USER
  const mailer = getTransporter()
  if (!mailer || !to) {
    console.warn('[notify] Skipping order email — SMTP or ADMIN_EMAIL not configured')
    return
  }

  try {
    await mailer.sendMail({
      from: `"Organic Fresh" <${from}>`,
      to,
      subject: `New order ${order.orderNumber} — ₹${order.total}`,
      text: orderSummaryText(order),
    })
  } catch (err) {
    console.error('[notify] Failed to send order email:', err.message)
  }
}

// Free instant message via a Telegram bot. Create a bot with @BotFather
// (free, 2 minutes), then set TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID in .env.
export async function sendTelegramAlert(order) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    console.warn('[notify] Skipping Telegram alert — TELEGRAM_BOT_TOKEN/CHAT_ID not configured')
    return
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🛎️ ${orderSummaryText(order)}`,
      }),
    })
    if (!res.ok) {
      const body = await res.text()
      console.error('[notify] Telegram API error:', body)
    }
  } catch (err) {
    console.error('[notify] Failed to send Telegram alert:', err.message)
  }
}

// Fires both, in parallel, without letting either one block or fail the order.
export function notifyAdminsOfNewOrder(order) {
  Promise.allSettled([sendOrderEmail(order), sendTelegramAlert(order)])
}

// General-purpose customer email, reusing the same SMTP setup as the admin
// order alert above. Used by the abandoned-cart reminder job. Best-effort
// like everything else here — never throws.
export async function sendCustomerEmail(toEmail, subject, text) {
  const from = process.env.SMTP_USER
  const mailer = getTransporter()
  if (!mailer || !toEmail) {
    console.warn('[notify] Skipping customer email — SMTP not configured or no recipient')
    return
  }
  try {
    await mailer.sendMail({ from: `"Organic Fresh" <${from}>`, to: toEmail, subject, text })
  } catch (err) {
    console.error('[notify] Failed to send customer email:', err.message)
  }
}
