import { useEffect, useState } from 'react'
import { fetchAllOrders, updateOrderStatus, updateOrderPaymentStatus } from '../../services/adminService'
import { useAdminOrdersSocket } from '../../context/AdminOrdersSocketContext'

const STATUSES = ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled']
const PAYMENT_STATUSES = ['pending', 'paid', 'failed']

export default function AdminOrders() {
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
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

  return (
    <div>
      <h1 className="font-display text-2xl text-forest font-semibold mb-6">Orders</h1>

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

      <div className="bg-white border border-forest/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-sprout/20 text-left text-xs uppercase tracking-wide text-charcoal/50">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Deliver to</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Order Status</th>
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
                <td className="px-4 py-3">
                  <ul className="space-y-0.5">
                    {o.items.map((item, i) => (
                      <li key={i} className="text-xs text-charcoal/70 whitespace-nowrap">
                        {item.emoji} {item.name} <span className="text-charcoal/40">× {item.qty}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-3 font-mono">₹{o.total}</td>
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
