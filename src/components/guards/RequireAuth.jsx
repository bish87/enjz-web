import { Navigate, useLocation } from 'react-router-dom'

import { LoadingScreen } from '@/components/common/Spinner'
import { useAuth } from '@/context/AuthContext'

export function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export function RequireRole({ role, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user.role !== role) {
    return <Navigate to="/" replace />
  }

  return children
}
