import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'

const links = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { totalItems, openDrawer } = useCart()
  const { items: wishlistItems } = useWishlist()
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur border-b border-forest/10">
      <nav className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-forest">
          <span className="text-2xl">🌱</span>
          Organic<span className="text-leaf">Fresh</span>
        </Link>

        <ul className="hidden md:flex items-center gap-8 font-medium text-sm text-charcoal/80">
          {links.map((l) => (
            <li key={l.label}>
              <NavLink
                to={l.to}
                className={({ isActive }) =>
                  `hover:text-leaf transition-colors ${isActive ? 'text-forest font-semibold' : ''}`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/shop" aria-label="Search" className="text-charcoal/70 hover:text-forest transition-colors text-lg">
            🔍
          </Link>
          <Link to="/wishlist" aria-label="Wishlist" className="relative text-charcoal/70 hover:text-forest transition-colors text-lg">
            ♡
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-turmeric text-white text-[10px] font-mono rounded-full w-4 h-4 flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </Link>
          <button onClick={openDrawer} className="relative text-charcoal/70 hover:text-forest transition-colors text-lg" aria-label="Cart">
            🧺
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-turmeric text-white text-[10px] font-mono rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-sm font-medium text-turmeric hover:text-forest transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/orders"
                className="text-sm font-medium text-charcoal/70 hover:text-forest transition-colors"
              >
                Hi, {user.name.split(' ')[0]}
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium text-charcoal/50 hover:text-forest transition-colors"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-forest text-cream text-sm font-medium px-4 py-2 rounded-full hover:bg-leaf transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>

        <div className="md:hidden flex items-center gap-4">
          <button onClick={openDrawer} className="relative text-charcoal/70 text-lg" aria-label="Cart">
            🧺
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-turmeric text-white text-[10px] font-mono rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
          <button
            className="text-2xl text-forest"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-forest/10 bg-cream"
          >
            <ul className="flex flex-col px-5 py-4 gap-4 font-medium text-charcoal/80">
              {links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} onClick={() => setOpen(false)}>
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/wishlist" onClick={() => setOpen(false)} className="flex items-center gap-2">
                  ♡ Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}
                </Link>
              </li>
              {isAuthenticated ? (
                <>
                  {user.role === 'admin' && (
                    <li>
                      <Link to="/admin" onClick={() => setOpen(false)} className="text-turmeric font-medium">
                        Admin dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link to="/orders" onClick={() => setOpen(false)}>
                      Hi, {user.name.split(' ')[0]} · Your orders
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        logout()
                        setOpen(false)
                      }}
                      className="text-charcoal/50"
                    >
                      Log out
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="bg-forest text-cream text-sm font-medium px-4 py-2 rounded-full block text-center"
                  >
                    Sign In
                  </Link>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
