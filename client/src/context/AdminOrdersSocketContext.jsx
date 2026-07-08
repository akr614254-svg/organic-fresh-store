import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { getAdminSocket, disconnectAdminSocket } from '../services/socket'

const AdminOrdersSocketContext = createContext(null)

// Wraps the admin area. Opens one Socket.io connection for the whole
// dashboard, keeps a running "unseen new orders" count for the sidebar
// badge, and remembers the most recent one for a small toast.
export function AdminOrdersSocketProvider({ children }) {
  const { user } = useAuth()
  const [newOrderCount, setNewOrderCount] = useState(0)
  const [latestOrder, setLatestOrder] = useState(null)
  const [connected, setConnected] = useState(false)
  const toastTimeout = useRef(null)

  useEffect(() => {
    if (!user || user.role !== 'admin') return

    const socket = getAdminSocket()

    const handleConnect = () => setConnected(true)
    const handleDisconnect = () => setConnected(false)
    const handleNewOrder = (order) => {
      setNewOrderCount((c) => c + 1)
      setLatestOrder(order)
      clearTimeout(toastTimeout.current)
      toastTimeout.current = setTimeout(() => setLatestOrder(null), 6000)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('new-order', handleNewOrder)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('new-order', handleNewOrder)
      clearTimeout(toastTimeout.current)
      disconnectAdminSocket()
    }
  }, [user])

  const clearNewOrderCount = () => setNewOrderCount(0)
  const dismissToast = () => setLatestOrder(null)

  return (
    <AdminOrdersSocketContext.Provider
      value={{ newOrderCount, latestOrder, connected, clearNewOrderCount, dismissToast }}
    >
      {children}
    </AdminOrdersSocketContext.Provider>
  )
}

export function useAdminOrdersSocket() {
  const ctx = useContext(AdminOrdersSocketContext)
  if (!ctx) throw new Error('useAdminOrdersSocket must be used within AdminOrdersSocketProvider')
  return ctx
}
