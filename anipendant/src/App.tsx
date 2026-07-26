import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import ErrorBoundary from '@/components/ErrorBoundary'
import Loading from '@/components/Loading'

import AuthPage from '@/features/auth/AuthPage'
import OnboardingPage from '@/features/onboarding/OnboardingPage'
import BrowsePage from '@/features/browse/BrowsePage'
import AnimeDetail from '@/features/browse/AnimeDetail'
import ShowsPage from '@/features/shows/ShowsPage'
import ShowDetail from '@/features/shows/ShowDetail'
import AccountPage from '@/features/account/AccountPage'

function HomeRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <Loading fullPage />
  if (!user) return <Navigate to="/auth" replace />
  if (!user.onboarding_complete) return <Navigate to="/onboarding" replace />
  return <Navigate to="/browse" replace />
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route element={<Layout />}>
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/browse/:id" element={<AnimeDetail />} />
            <Route path="/shows" element={<ShowsPage />} />
            <Route path="/shows/:id" element={<ShowDetail />} />
            <Route path="/account" element={<AccountPage />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </ErrorBoundary>
  )
}
