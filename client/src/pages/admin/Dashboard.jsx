import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { fetchStats } from '../../services/adminService'

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white border border-forest/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono uppercase tracking-wide text-charcoal/40">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="font-display text-2xl text-forest font-semibold">{value}</div>
    </div>
  )
}

function toInputDate(d) {
  return d.toISOString().slice(0, 10)
}

const today = new Date()
const sevenDaysAgo = new Date()
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [from, setFrom] = useState(toInputDate(sevenDaysAgo))
  const [to, setTo] = useState(toInputDate(today))

  useEffect(() => {
    fetchStats({ from, to }).then(setStats).catch((err) => setError(err.message))
  }, [from, to])

  const applyPreset = (days) => {
    const start = new Date()
    start.setDate(start.getDate() - (days - 1))
    setFrom(toInputDate(start))
    setTo(toInputDate(new Date()))
  }

  if (error) {
    return <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
  }

  if (!stats) {
    return <p className="text-charcoal/50">Loading dashboard…</p>
  }

  const chartData = stats.salesByDay.map((d) => ({
    day: new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    total: d.total,
  }))

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="font-display text-2xl text-forest font-semibold">Dashboard</h1>

        <div className="flex items-center gap-2 flex-wrap">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => applyPreset(d)}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-forest/15 text-charcoal/60 hover:border-leaf"
            >
              Last {d}d
            </button>
          ))}
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-white border border-forest/15 rounded-full px-3 py-1.5 text-xs outline-none"
          />
          <span className="text-charcoal/30 text-xs">to</span>
          <input
            type="date"
            value={to}
            min={from}
            max={toInputDate(today)}
            onChange={(e) => setTo(e.target.value)}
            className="bg-white border border-forest/15 rounded-full px-3 py-1.5 text-xs outline-none"
          />
        </div>
      </div>

      {stats.lowStockProducts.length > 0 && (
        <div className="bg-turmeric/10 border border-turmeric/30 rounded-2xl px-5 py-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚠️</span>
            <span className="text-sm font-medium text-turmeric">
              {stats.lowStockProducts.length} product{stats.lowStockProducts.length > 1 ? 's' : ''} running low on stock
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.lowStockProducts.map((p) => (
              <Link
                key={p._id}
                to="/admin/products"
                className="text-xs bg-white border border-turmeric/30 rounded-full px-3 py-1.5 text-charcoal/70 hover:border-turmeric"
              >
                {p.emoji} {p.name} — {p.stock === 0 ? 'out of stock' : `${p.stock} left`}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Sales (all-time)" value={`₹${stats.totalSales.toLocaleString('en-IN')}`} icon="💰" />
        <StatCard label="Orders (all-time)" value={stats.totalOrders} icon="📦" />
        <StatCard label="Products" value={stats.totalProducts} icon="🥬" />
        <StatCard label="Users" value={stats.totalUsers} icon="👤" />
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-white border border-forest/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-forest">Sales in selected range</h2>
            <span className="text-sm font-mono text-charcoal/60">
              ₹{stats.rangeSales.toLocaleString('en-IN')} · {stats.rangeOrders} orders
            </span>
          </div>
          {chartData.length === 0 ? (
            <p className="text-sm text-charcoal/50">No orders in this range.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1B433215" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#1F231880" />
                <YAxis tick={{ fontSize: 12 }} stroke="#1F231880" />
                <Tooltip formatter={(v) => [`₹${v}`, 'Sales']} />
                <Bar dataKey="total" fill="#40916C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white border border-forest/10 rounded-2xl p-5">
          <h2 className="font-medium text-forest mb-4">Top customers</h2>
          {stats.topCustomers.length === 0 ? (
            <p className="text-sm text-charcoal/50">No orders in this range.</p>
          ) : (
            <div className="flex flex-col divide-y divide-forest/5">
              {stats.topCustomers.map((c, i) => (
                <div key={c._id} className="flex items-center justify-between py-2.5 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-charcoal/30 text-xs w-4 shrink-0">#{i + 1}</span>
                    <div className="min-w-0">
                      <div className="text-charcoal/80 truncate">{c.name}</div>
                      <div className="text-xs text-charcoal/40">{c.orderCount} order{c.orderCount > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <span className="font-mono text-forest shrink-0">₹{c.totalSpent}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-forest/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-forest">Recent orders</h2>
          <Link to="/admin/orders" className="text-sm text-leaf hover:text-forest">
            View all →
          </Link>
        </div>
        <div className="flex flex-col divide-y divide-forest/5">
          {stats.recentOrders.map((o) => (
            <div key={o._id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <div className="font-mono text-charcoal/70">{o.orderNumber}</div>
                <div className="text-xs text-charcoal/40">{o.user?.name || 'Unknown'}</div>
              </div>
              <span className="font-mono text-forest">₹{o.total}</span>
            </div>
          ))}
          {stats.recentOrders.length === 0 && (
            <p className="text-sm text-charcoal/50 py-3">No orders yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
