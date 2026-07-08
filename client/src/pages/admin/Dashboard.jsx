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

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats().then(setStats).catch((err) => setError(err.message))
  }, [])

  if (error) {
    return <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
  }

  if (!stats) {
    return <p className="text-charcoal/50">Loading dashboard…</p>
  }

  const chartData = stats.salesByDay.map((d) => ({
    day: new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' }),
    total: d.total,
  }))

  return (
    <div>
      <h1 className="font-display text-2xl text-forest font-semibold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Sales" value={`₹${stats.totalSales.toLocaleString('en-IN')}`} icon="💰" />
        <StatCard label="Orders" value={stats.totalOrders} icon="📦" />
        <StatCard label="Products" value={stats.totalProducts} icon="🥬" />
        <StatCard label="Users" value={stats.totalUsers} icon="👤" />
      </div>

      <div className="bg-white border border-forest/10 rounded-2xl p-5 mb-8">
        <h2 className="font-medium text-forest mb-4">Sales — last 7 days</h2>
        {chartData.length === 0 ? (
          <p className="text-sm text-charcoal/50">No orders yet this week.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1B433215" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#1F231880" />
              <YAxis tick={{ fontSize: 12 }} stroke="#1F231880" />
              <Tooltip formatter={(v) => [`₹${v}`, 'Sales']} />
              <Bar dataKey="total" fill="#40916C" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
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
