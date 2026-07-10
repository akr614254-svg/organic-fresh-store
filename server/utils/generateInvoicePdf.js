import PDFDocument from 'pdfkit'

const BRAND_GREEN = '#1B4332'
const ACCENT_GREEN = '#40916C'
const MUTED = '#6b6b63'

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

// pdfkit's base-14 fonts don't reliably render emoji or the ₹ glyph, so the
// invoice uses "Rs" throughout and strips emoji from item names.
function cleanName(name) {
  return name.replace(/\p{Extended_Pictographic}/gu, '').trim()
}

/**
 * Streams a one-page GST-style invoice PDF straight to the HTTP response.
 * Call this directly from a controller — it sets its own headers and calls
 * res.end() via doc.end(), no separate file is written to disk.
 */
export function streamInvoicePdf(order, res) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' })

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${order.orderNumber}.pdf"`)
  doc.pipe(res)

  // Header
  doc.fontSize(20).fillColor(BRAND_GREEN).text('Organic Fresh', 50, 50)
  doc.fontSize(9).fillColor(MUTED).text('Farm-fresh vegetables, delivered', 50, 74)

  doc.fontSize(16).fillColor(BRAND_GREEN).text('TAX INVOICE', 0, 50, { align: 'right' })
  doc.fontSize(9).fillColor(MUTED)
    .text(`Invoice #: ${order.orderNumber}`, { align: 'right' })
    .text(`Date: ${formatDate(order.createdAt)}`, { align: 'right' })
    .text(`Payment: ${order.paymentMethod === 'razorpay' ? 'Razorpay' : 'Cash on Delivery'} (${order.paymentStatus})`, { align: 'right' })

  doc.moveTo(50, 115).lineTo(545, 115).strokeColor('#dddddd').stroke()

  // Bill to
  doc.fontSize(9).fillColor(MUTED).text('BILLED TO', 50, 130)
  doc.fontSize(11).fillColor('#1F2318')
    .text(order.deliveryAddress.name, 50, 144)
    .fontSize(9).fillColor(MUTED)
    .text(order.deliveryAddress.address, 50, 160, { width: 300 })
    .text(order.deliveryAddress.phone, 50, doc.y + 2)

  doc.fontSize(9).fillColor(MUTED).text('DELIVERY SLOT', 350, 130)
  doc.fontSize(10).fillColor('#1F2318').text(order.deliverySlot || '—', 350, 144)

  // Item table
  let y = 220
  doc.moveTo(50, y).lineTo(545, y).strokeColor(ACCENT_GREEN).stroke()
  y += 8
  doc.fontSize(9).fillColor(ACCENT_GREEN)
    .text('ITEM', 50, y)
    .text('QTY', 320, y)
    .text('RATE', 390, y)
    .text('AMOUNT', 470, y)
  y += 14
  doc.moveTo(50, y).lineTo(545, y).strokeColor('#dddddd').stroke()
  y += 8

  doc.fontSize(10).fillColor('#1F2318')
  order.items.forEach((item) => {
    doc.text(cleanName(item.name), 50, y, { width: 250 })
    doc.text(String(item.qty), 320, y)
    doc.text(`Rs ${item.price}`, 390, y)
    doc.text(`Rs ${item.price * item.qty}`, 470, y)
    y += 20
  })

  y += 6
  doc.moveTo(320, y).lineTo(545, y).strokeColor('#dddddd').stroke()
  y += 10

  const summaryLine = (label, value, opts = {}) => {
    doc.fontSize(opts.bold ? 12 : 10).fillColor(opts.color || '#1F2318')
    doc.text(label, 320, y)
    doc.text(value, 470, y)
    y += opts.bold ? 20 : 16
  }

  summaryLine('Subtotal', `Rs ${order.subtotal}`)
  if (order.coupon?.discountAmount > 0) {
    summaryLine(`Discount (${order.coupon.code})`, `- Rs ${order.coupon.discountAmount}`, { color: '#B45309' })
  }
  summaryLine('CGST (2.5%)', `Rs ${order.cgst}`)
  summaryLine('SGST (2.5%)', `Rs ${order.sgst}`)
  summaryLine('Delivery Fee', order.deliveryFee === 0 ? 'Free' : `Rs ${order.deliveryFee}`)

  y += 4
  doc.moveTo(320, y).lineTo(545, y).strokeColor(BRAND_GREEN).stroke()
  y += 8
  summaryLine('Total Paid', `Rs ${order.total}`, { bold: true, color: BRAND_GREEN })

  doc.fontSize(8).fillColor(MUTED).text(
    'This is a system-generated invoice and does not require a signature. Thank you for shopping with Organic Fresh.',
    50,
    760,
    { width: 495, align: 'center' },
  )

  doc.end()
}
