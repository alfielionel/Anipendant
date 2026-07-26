import { type FormEvent, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface RegisterFormProps {
  onSuccess?: (email: string) => void
  onSwitchToLogin?: () => void
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const { register, error, loading, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    clearError()
    setValidationError(null)

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }
    if (username.length < 2) {
      setValidationError('Username must be at least 2 characters')
      return
    }

    try {
      await register(email, password, username)
      onSuccess?.(email)
    } catch {
      // error is set in context
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Create Account</h2>

      <div className="form-field">
        <label htmlFor="reg-email">Email</label>
        <input
          id="reg-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="form-field">
        <label htmlFor="reg-username">Username</label>
        <input
          id="reg-username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Your display name"
          required
          minLength={2}
          autoComplete="username"
        />
      </div>

      <div className="form-field">
        <label htmlFor="reg-password">Password</label>
        <input
          id="reg-password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>

      <div className="form-field">
        <label htmlFor="reg-confirm">Confirm Password</label>
        <input
          id="reg-confirm"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Repeat your password"
          required
          autoComplete="new-password"
        />
      </div>

      {(error || validationError) && (
        <p className="form-error">{validationError || error}</p>
      )}

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Creating account…' : 'Create Account'}
      </button>

      <p className="form-switch">
        Already have an account?{' '}
        <button type="button" className="link-btn" onClick={onSwitchToLogin}>
          Sign In
        </button>
      </p>
    </form>
  )
}
