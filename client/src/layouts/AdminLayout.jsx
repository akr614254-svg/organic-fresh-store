import { NavLink, Outlet, Link } from 'react-router-dom'
import { AdminOrdersSocketProvider, useAdminOrdersSocket } from '../context/AdminOrdersSocketContext'

const navItems = [
  { label: 'Dashboard', to: '/admin', end: true, icon: '📊' },
  { label: 'Products', to: '/admin/products', icon: '🥬' },
  { label: 'Orders', to: '/admin/orders', icon: '📦' },
  { label: 'Users', to: '/admin/users', icon: '👤' },
]

function AdminLayoutInner() {
  const { newOrderCount, latestOrder, connected, dismissToast } = useAdminOrdersSocket()

  return (
    <div className="min-h-screen bg-cream flex">
      <aside className="w-56 shrink-0 bg-forest text-cream flex flex-col">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold px-5 h-16 border-b border-cream/10">
          <span>🌱</span> Organic<span className="text-sprout">Fresh</span>
        </Link>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-cream/15 text-cream' : 'text-cream/60 hover:bg-cream/10 hover:text-cream'
                }`
              }
            >
              <span className="flex items-center gap-2">
                <span>{item.icon}</span> {item.label}
              </span>
              {item.to === '/admin/orders' && newOrderCount > 0 && (
                <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-sprout text-forest text-xs font-semibold flex items-center justify-center">
                  {newOrderCount > 9 ? '9+' : newOrderCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mx-3 mb-2 flex items-center gap-1.5 px-3 text-[11px] text-cream/40">
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-sprout' : 'bg-cream/30'}`} />
          {connected ? 'Live order updates on' : 'Reconnecting…'}
        </div>
        <Link
          to="/"
          className="mx-3 mb-4 px-3 py-2.5 rounded-xl text-sm font-medium text-cream/60 hover:bg-cream/10 hover:text-cream transition-colors"
        >
          ← Back to store
        </Link>
      </aside>

      <main className="flex-1 min-w-0 overflow-x-auto relative">
        <div className="p-6 md:p-8">
          <Outlet />
        </div>

        {latestOrder && (
          <div className="fixed bottom-6 right-6 z-50 bg-forest text-cream rounded-2xl shadow-lg px-5 py-4 flex items-start gap-3 max-w-xs">
            <span className="text-xl">🛎️</span>
            <div className="flex-1 text-sm">
              <div className="font-medium">New order received</div>
              <div className="text-cream/70 font-mono text-xs mt-0.5">
                {latestOrder.orderNumber} · ₹{latestOrder.total}
              </div>
            </div>
            <button onClick={dismissToast} className="text-cream/50 hover:text-cream text-xs">
              ✕
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default function AdminLayout() {
  return (
    <AdminOrdersSocketProvider>
      <AdminLayoutInner />
    </AdminOrdersSocketProvider>
  )
}
