import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-charcoal/50">Loading…</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-5 py-24 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="font-display text-2xl text-forest mb-2">Admins only</h1>
        <p className="text-charcoal/60">You don't have access to this page.</p>
      </div>
    )
  }

  return children
}
