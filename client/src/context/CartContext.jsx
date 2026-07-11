import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { clampQty, calcCartTotals, FREE_DELIVERY_THRESHOLD } from '../utils/cartMath'
import { fetchServerCart, syncServerCart, clearServerCart as clearServerCartApi } from '../services/cartService'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([]) // { id, name, price, unit, emoji, qty, stock }
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const previousUserId = useRef(user?._id ?? user?.id ?? null)

  // The cart only ever lives in memory (not localStorage), but React state
  // doesn't automatically reset just because someone logs out — the app
  // never unmounts. Without this, logging out (or logging in as someone
  // else) leaves the previous person's cart count showing. Clear it
  // whenever the logged-in identity actually changes.
  const hydratingRef = useRef(false)

  useEffect(() => {
    const currentUserId = user?._id ?? user?.id ?? null
    if (currentUserId !== previousUserId.current) {
      setItems([])
      previousUserId.current = currentUserId
      // Just logged in — pull down whatever cart was saved from another
      // device/session (e.g. abandoned there earlier) rather than leaving
      // the customer starting from empty every time they sign in.
      if (currentUserId) {
        hydratingRef.current = true
        fetchServerCart()
          .then((serverItems) => {
            if (serverItems?.length) {
              setItems(serverItems.map((i) => ({ id: i.legacyId, name: i.name, price: i.price, unit: i.unit, emoji: i.emoji, qty: i.qty })))
            }
          })
          .catch(() => {}) // best-effort — a failed pull just means starting empty, same as before
          .finally(() => {
            hydratingRef.current = false
          })
      }
    }
  }, [user])

  // Push the cart up to the server on a short debounce whenever it changes
  // for a signed-in customer — this is what the abandoned-cart reminder job
  // (and cross-device restore above) reads from. Best-effort: a failed
  // sync never blocks the local cart from working. Skipped while the cart
  // is still being hydrated from the server, so an empty local cart never
  // races ahead and overwrites the one we just fetched.
  useEffect(() => {
    const currentUserId = user?._id ?? user?.id ?? null
    if (!currentUserId || hydratingRef.current) return
    const timer = setTimeout(() => {
      if (!hydratingRef.current) syncServerCart(items).catch(() => {})
    }, 1500)
    return () => clearTimeout(timer)
  }, [items, user])

  const addToCart = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, qty: clampQty(i.qty + qty, product.stock), stock: product.stock }
            : i
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          unit: product.unit,
          emoji: product.emoji,
          stock: product.stock,
          qty: clampQty(qty, product.stock),
        },
      ]
    })
    setDrawerOpen(true)
  }

  const updateQty = (id, qty) => {
    if (qty <= 0) {
      removeFromCart(id)
      return
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: clampQty(qty, i.stock) } : i)))
  }

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const clearCart = () => {
    setItems([])
    if (user?._id ?? user?.id) {
      clearServerCartApi().catch(() => {})
    }
  }

  const { totalItems, subtotal, deliveryFee, total } = useMemo(() => calcCartTotals(items), [items])

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
