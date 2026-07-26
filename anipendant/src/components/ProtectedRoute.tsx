import { type ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Loading from '@/components/Loading'

export default function ProtectedRoute({ children }: { children?: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <Loading fullPage />

  if (!user) return <Navigate to="/auth" replace />

  return children ? <>{children}</> : <Outlet />
}
