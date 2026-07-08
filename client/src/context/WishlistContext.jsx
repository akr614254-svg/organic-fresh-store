import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([]) // full product objects
  const previousUserId = useRef(user?._id ?? user?.id ?? null)

  // Same reasoning as CartContext — reset on login/logout so one person's
  // wishlist doesn't visually carry over to the next.
  useEffect(() => {
    const currentUserId = user?._id ?? user?.id ?? null
    if (currentUserId !== previousUserId.current) {
      setItems([])
      previousUserId.current = currentUserId
    }
  }, [user])

  const isWishlisted = (id) => items.some((i) => i.id === id)

  const toggleWishlist = (product) => {
    setItems((prev) =>
      prev.some((i) => i.id === product.id)
        ? prev.filter((i) => i.id !== product.id)
        : [...prev, product],
    )
  }

  const removeFromWishlist = (id) => setItems((prev) => prev.filter((i) => i.id !== id))

  const value = { items, isWishlisted, toggleWishlist, removeFromWishlist }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider')
  return ctx
}
