import { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

const DELIVERY_FEE = 25
const FREE_DELIVERY_THRESHOLD = 300

export function CartProvider({ children }) {
  const [items, setItems] = useState([]) // { id, name, price, unit, emoji, qty }
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  const addToCart = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i))
      }
      return [
        ...prev,
        { id: product.id, name: product.name, price: product.price, unit: product.unit, emoji: product.emoji, qty },
      ]
    })
    setDrawerOpen(true)
  }

  const updateQty = (id, qty) => {
    if (qty <= 0) {
      removeFromCart(id)
      return
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)))
  }

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const clearCart = () => setItems([])

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items])
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.qty * i.price, 0), [items])
  const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const total = subtotal + deliveryFee

  const value = {
    items,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
    deliveryFee,
    total,
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    isDrawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
