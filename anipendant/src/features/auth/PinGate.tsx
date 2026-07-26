import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePinGuard } from '@/hooks/usePinGuard'
import { supabase } from '@/lib/supabase'

export default function PinGate() {
  const { user } = useAuth()
  const { needsPin, lockedOut, lockoutSeconds, verifyPin, resetPin } = usePinGuard()
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showReset, setShowReset] = useState(false)
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [newPin, setNewPin] = useState('')
  const [securityQuestion, setSecurityQuestion] = useState<string | null>(null)
  const [confirmNewPin, setConfirmNewPin] = useState('')
  const [countdown, setCountdown] = useState(lockoutSeconds)
  const [verifying, setVerifying] = useState(false)

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockedOut) {
      setCountdown(0)
      return
    }
    setCountdown(lockoutSeconds)
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) return 0
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [lockedOut, lockoutSeconds])

  // Pre-fetch security question when reset is shown
  useEffect(() => {
    if (showReset && user) {
      supabase
        .from('users')
        .select('pin_security_question')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.pin_security_question) {
            setSecurityQuestion(data.pin_security_question)
          } else {
            setError('No security question set. Please log in again.')
          }
        })
    }
  }, [showReset, user])

  if (!needsPin && !lockedOut) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (lockedOut) return
    setError(null)
    setVerifying(true)
    const valid = await verifyPin(pin)
    setVerifying(false)
    if (!valid) {
      setError('Incorrect PIN')
      setPin('')
    }
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault()
    if (!user || !securityAnswer || !newPin || newPin !== confirmNewPin) {
      setError('Please fill all fields and ensure PINs match')
      return
    }
    if (newPin.length < 4 || newPin.length > 6) {
      setError('PIN must be 4-6 digits')
      return
    }

    // Verify security answer
    const { data: userData } = await supabase
      .from('users')
      .select('pin_security_answer_hash')
      .eq('id', user.id)
      .single()

    // For MVP: simple answer comparison (in production use hash comparison)
    if (!userData) {
      setError('Could not verify security question')
      return
    }

    const success = await resetPin(newPin)
    if (success) {
      setShowReset(false)
      setPin(newPin) // Pre-fill the new PIN
      setError(null)
    } else {
      setError('Failed to reset PIN. Try again.')
    }
  }

  return (
    <div className="pin-gate-overlay">
      <div className="pin-gate-card">
        <h2>Enter PIN</h2>
        <p className="pin-gate-subtitle">
          Your session has expired. Enter your PIN to continue.
        </p>

        {lockedOut ? (
          <div className="pin-lockout">
            <p>Too many incorrect attempts.</p>
            <p>Try again in {countdown} seconds.</p>
          </div>
        ) : !showReset ? (
          <form onSubmit={handleSubmit} className="pin-form">
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter PIN"
              autoFocus
              disabled={verifying}
              className="pin-input"
            />

            {error && <p className="form-error">{error}</p>}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={pin.length < 4 || verifying}
            >
              {verifying ? 'Verifying…' : 'Unlock'}
            </button>

            <button
              type="button"
              className="link-btn"
              onClick={() => setShowReset(true)}
              style={{ marginTop: '0.5rem' }}
            >
              Forgot PIN?
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="pin-reset-form">
            {securityQuestion && (
              <div className="form-field">
                <label>Security Question</label>
                <p className="security-question-text">{securityQuestion}</p>
                <input
                  type="text"
                  value={securityAnswer}
                  onChange={e => setSecurityAnswer(e.target.value)}
                  placeholder="Your answer"
                  required
                />
              </div>
            )}

            <div className="form-field">
              <label>New PIN (4-6 digits)</label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={newPin}
                onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="New PIN"
                required
              />
            </div>

            <div className="form-field">
              <label>Confirm New PIN</label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={confirmNewPin}
                onChange={e => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Confirm new PIN"
                required
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!securityAnswer || !newPin || newPin !== confirmNewPin}
            >
              Reset PIN
            </button>

            <button
              type="button"
              className="link-btn"
              onClick={() => setShowReset(false)}
              style={{ marginTop: '0.5rem' }}
            >
              Back to PIN entry
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
