import { createContext, useContext, useState } from 'react'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]) // full product objects

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
