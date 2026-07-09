import { createContext, useContext, useEffect, useState } from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext(null)
const TOKEN_KEY = 'of_token'
const USER_KEY = 'of_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // On first load, verify the stored token is still valid and refresh the user.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    authService
      .fetchProfile()
      .then((freshUser) => {
        setUser(freshUser)
        localStorage.setItem(USER_KEY, JSON.stringify(freshUser))
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const persistSession = ({ user: newUser, token }) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setUser(newUser)
  }

  const register = async (form) => {
    setError(null)
    try {
      const result = await authService.register(form)
      persistSession(result)
      return result.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const login = async (form) => {
    setError(null)
    try {
      const result = await authService.login(form)
      persistSession(result)
      return result.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  // Used after profile/address updates that don't go through login/register
  // (e.g. saving a new address on the Account page) — keeps context state
  // and the cached copy in localStorage consistent with each other.
  const updateUser = (freshUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(freshUser))
    setUser(freshUser)
  }

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    register,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
