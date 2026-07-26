import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from '@/features/auth/LoginForm'
import RegisterForm from '@/features/auth/RegisterForm'
import { useAuth } from '@/hooks/useAuth'
import Loading from '@/components/Loading'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && !loading) {
      if (!user.onboarding_complete) {
        navigate('/onboarding', { replace: true })
      } else {
        navigate('/browse', { replace: true })
      }
    }
  }, [user, loading, navigate])

  if (loading) return <Loading fullPage message="Checking session…" />

  // If user just registered but profile isn't ready (table doesn't exist yet),
  // tell them to sign in
  if (registeredEmail && !user && !loading) {
    return (
      <div className="auth-page">
        <div className="aero-orb" />
        <div className="auth-container">
          <h1 className="app-title">Anipendant</h1>
          <div className="auth-form">
            <h2>Account Created!</h2>
            <p>Your account has been created. Please sign in with your new credentials.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => { setRegisteredEmail(null); setMode('login') }}
              style={{ marginTop: '1rem' }}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
        <div className="aero-orb" />
        <div className="auth-container">
        <h1 className="app-title">Anipendant</h1>
        {mode === 'login' ? (
          <LoginForm
            onSuccess={() => {
              // navigation is handled by the useEffect above
            }}
            onSwitchToRegister={() => setMode('register')}
          />
        ) : (
          <RegisterForm
            onSuccess={(email) => {
              setRegisteredEmail(email)
            }}
            onSwitchToLogin={() => setMode('login')}
          />
        )}
      </div>
    </div>
  )
}
