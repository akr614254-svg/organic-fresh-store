import { useEffect, useState } from 'react'
import { fetchAllOrders, updateOrderStatus, updateOrderPaymentStatus, resolveReturn, processRefundsNow } from '../../services/adminService'
import { useAdminOrdersSocket } from '../../context/AdminOrdersSocketContext'

const STATUSES = ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled']
const PAYMENT_STATUSES = ['pending', 'paid', 'failed']

export default function AdminOrders() {
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [scheduleDates, setScheduleDates] = useState({}) // orderId -> yyyy-mm-dd
  const [processingRefunds, setProcessingRefunds] = useState(false)
  const [refundNotice, setRefundNotice] = useState('')
  const { newOrderCount, clearNewOrderCount } = useAdminOrdersSocket()

  useEffect(() => {
    fetchAllOrders().then(setOrders).catch((err) => setError(err.message))
  }, [])

  // Visiting the Orders page is what "acknowledges" new orders — clear the
  // sidebar badge, and re-fetch if we arrived here because the badge fired
  // so the new order(s) actually show up in the table.
  useEffect(() => {
    if (newOrderCount > 0) {
      fetchAllOrders().then(setOrders).catch((err) => setError(err.message))
      clearNewOrderCount()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleStatusChange = async (order, status) => {
    setUpdatingId(order._id)
    try {
      const updated = await updateOrderStatus(order._id, status)
      setOrders((prev) => prev.map((o) => (o._id === order._id ? updated : o)))
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const handlePaymentStatusChange = async (order, paymentStatus) => {
    setUpdatingId(order._id)
    try {
      const updated = await updateOrderPaymentStatus(order._id, paymentStatus)
      setOrders((prev) => prev.map((o) => (o._id === order._id ? updated : o)))
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleResolveReturn = async (order, approve, scheduledFor) => {
    setUpdatingId(order._id)
    try {
      const updated = await resolveReturn(order._id, approve, scheduledFor || undefined)
      setOrders((prev) => prev.map((o) => (o._id === order._id ? updated : o)))
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleProcessRefundsNow = async () => {
    setProcessingRefunds(true)
    setRefundNotice('')
    try {
      const { processed } = await processRefundsNow()
      setRefundNotice(processed === 0 ? 'No refunds were due.' : `Processed ${processed} due refund${processed > 1 ? 's' : ''}.`)
      fetchAllOrders().then(setOrders).catch((err) => setError(err.message))
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessingRefunds(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl text-forest font-semibold">Orders</h1>
        <div className="flex items-center gap-3">
          {refundNotice && <span className="text-xs text-charcoal/50">{refundNotice}</span>}
          <button
            onClick={handleProcessRefundsNow}
            disabled={processingRefunds}
            className="text-xs font-medium bg-white border border-forest/15 text-charcoal/70 px-3 py-2 rounded-full hover:border-leaf disabled:opacity-50"
          >
            {processingRefunds ? 'Checking…' : '↻ Process due scheduled refunds'}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

      <div className="bg-white border border-forest/10 rounded-2xl overflow-x-auto">
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="bg-sprout/20 text-left text-xs uppercase tracking-wide text-charcoal/50">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Deliver to</th>
              <th className="px-4 py-3">Delivery</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Order Status</th>
              <th className="px-4 py-3">Return/Refund</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/5">
            {orders?.map((o) => (
              <tr key={o._id} className="align-top">
                <td className="px-4 py-3">
                  <div className="font-mono text-charcoal/70">{o.orderNumber}</div>
                  <div className="text-xs text-charcoal/40">
                    {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>{o.user?.name || 'Unknown'}</div>
                  <div className="text-xs text-charcoal/40">{o.user?.email}</div>
                </td>
                <td className="px-4 py-3 max-w-[14rem]">
                  <div className="text-xs text-charcoal/70 truncate" title={o.deliveryAddress?.address}>
                    {o.deliveryAddress?.address}
                  </div>
                  {o.deliveryAddress?.lat && o.deliveryAddress?.lng && (
                    <a
                      href={`https://www.google.com/maps?q=${o.deliveryAddress.lat},${o.deliveryAddress.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-leaf hover:text-forest underline underline-offset-2"
                    >
                      View on map
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-charcoal/60 whitespace-nowrap">
                  {o.deliveryDate
                    ? new Date(o.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : '—'}
                  <div className="text-charcoal/40">{o.deliverySlot}</div>
                </td>
                <td className="px-4 py-3">
                  <ul className="space-y-0.5">
                    {o.items.map((item, i) => (
                      <li key={i} className="text-xs text-charcoal/70 whitespace-nowrap">
                        {item.emoji} {item.name} <span className="text-charcoal/40">× {item.qty}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-3 font-mono">
                  ₹{o.total}
                  {o.walletAmountUsed > 0 && (
                    <div className="text-[10px] text-forest font-sans whitespace-nowrap">
                      💰 ₹{o.walletAmountUsed} paid via wallet
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-charcoal/60 capitalize mb-1">{o.paymentMethod}</div>
                  <select
                    value={o.paymentStatus}
                    disabled={updatingId === o._id}
                    onChange={(e) => handlePaymentStatusChange(o, e.target.value)}
                    className={`text-xs px-1.5 py-1 rounded-lg border outline-none capitalize ${
                      o.paymentStatus === 'paid'
                        ? 'bg-sprout/40 text-forest border-sprout/50'
                        : o.paymentStatus === 'failed'
                          ? 'bg-red-50 text-red-500 border-red-100'
                          : 'bg-turmeric/15 text-turmeric border-turmeric/20'
                    }`}
                  >
                    {PAYMENT_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {o.paymentMethod === 'cod' && o.paymentStatus !== 'paid' && (
                    <div className="text-[10px] text-charcoal/40 mt-1">Mark paid once cash is collected</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={o.status}
                    disabled={updatingId === o._id}
                    onChange={(e) => handleStatusChange(o, e.target.value)}
                    className="bg-white border border-forest/15 rounded-lg px-2 py-1.5 text-xs outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  {(!o.returnRequest || o.returnRequest.status === 'none') && (
                    <span className="text-xs text-charcoal/30">—</span>
                  )}
                  {o.returnRequest?.status === 'requested' && (
                    <div className="max-w-[14rem]">
                      <p className="text-xs text-charcoal/70 mb-1.5" title={o.returnRequest.reason}>
                        {o.returnRequest.reason || 'No reason given'}
                      </p>
                      {o.paymentMethod === 'razorpay' && o.paymentStatus === 'paid' && (
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <input
                            type="date"
                            min={new Date().toISOString().slice(0, 10)}
                            value={scheduleDates[o._id] || ''}
                            onChange={(e) => setScheduleDates((prev) => ({ ...prev, [o._id]: e.target.value }))}
                            className="text-[11px] border border-forest/15 rounded-lg px-1.5 py-1 outline-none w-full"
                            title="Optional: schedule the refund for a later date instead of issuing it immediately"
                          />
                        </div>
                      )}
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleResolveReturn(o, true, scheduleDates[o._id])}
                          disabled={updatingId === o._id}
                          className="text-[11px] bg-sprout/40 text-forest px-2 py-1 rounded-full hover:bg-sprout/60 disabled:opacity-50"
                        >
                          {scheduleDates[o._id] ? 'Approve & schedule' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleResolveReturn(o, false)}
                          disabled={updatingId === o._id}
                          className="text-[11px] bg-red-50 text-red-500 px-2 py-1 rounded-full hover:bg-red-100 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                  {o.returnRequest?.status === 'approved' && (
                    <div className="max-w-[12rem]">
                      <span className="text-xs text-forest bg-sprout/40 px-2 py-1 rounded-full inline-block mb-1">Approved</span>
                      {o.returnRequest.refund?.status === 'scheduled' && (
                        <p className="text-[11px] text-charcoal/50">
                          💤 Refund ₹{o.returnRequest.refund.amount} on{' '}
                          {new Date(o.returnRequest.refund.scheduledFor).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      )}
                      {o.returnRequest.refund?.status === 'processing' && (
                        <p className="text-[11px] text-charcoal/50">⏳ Refund processing…</p>
                      )}
                      {o.returnRequest.refund?.status === 'completed' && (
                        <p className="text-[11px] text-charcoal/50">
                          {o.returnRequest.refund.method === 'wallet'
                            ? `💰 ₹${o.returnRequest.refund.amount} credited to wallet`
                            : `✅ Refunded ₹${o.returnRequest.refund.amount}`}
                        </p>
                      )}
                      {o.returnRequest.refund?.status === 'failed' && (
                        <p className="text-[11px] text-red-500" title={o.returnRequest.refund.failureReason}>⚠️ Refund failed</p>
                      )}
                    </div>
                  )}
                  {o.returnRequest?.status === 'rejected' && (
                    <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">Rejected</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders?.length === 0 && <p className="text-sm text-charcoal/50 p-4">No orders yet.</p>}
        {!orders && !error && <p className="text-sm text-charcoal/50 p-4">Loading…</p>}
      </div>
    </div>
  )
}
