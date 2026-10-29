import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { api, TOKEN_KEY } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function bootstrap() {
      const storedToken = localStorage.getItem(TOKEN_KEY)

      if (!storedToken) {
        setLoading(false)
        return
      }

      try {
        const { data } = await api.get('/auth/me')
        if (active) {
          setUser(data.user)
          setToken(storedToken)
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        if (active) {
          setUser(null)
          setToken(null)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    function handleUnauthorized() {
      setUser(null)
      setToken(null)
      queryClient.clear()
    }

    window.addEventListener('enjz:unauthorized', handleUnauthorized)
    return () =>
      window.removeEventListener('enjz:unauthorized', handleUnauthorized)
  }, [])

  const login = useCallback(async (credentials) => {
    const { data } = await api.post('/auth/login', credentials)
    localStorage.setItem(TOKEN_KEY, data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    localStorage.setItem(TOKEN_KEY, data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    queryClient.clear()
  }, [])

  const refreshUser = useCallback(async () => {
    const { data } = await api.get('/auth/me')
    setUser(data.user)
    return data.user
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
      hasRole: (...roles) => Boolean(user && roles.includes(user.role)),
    }),
    [user, token, loading, login, register, logout, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
