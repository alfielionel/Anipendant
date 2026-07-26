import { useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface StepPinProps {
  onNext: () => void
  onBack: () => void
}

export default function StepPin({ onNext, onBack }: StepPinProps) {
  const { user } = useAuth()
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [securityQuestion, setSecurityQuestion] = useState('')
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [skip, setSkip] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setError(null)

    if (skip) {
      onNext()
      return
    }

    if (pin.length < 4 || pin.length > 6) {
      setError('PIN must be 4-6 digits')
      return
    }
    if (pin !== confirmPin) {
      setError('PINs do not match')
      return
    }

    setSaving(true)

    // Prepare updates
    const updates: Record<string, unknown> = {
      pin_hash: pin, // Will be hashed by the DB trigger or RPC
    }

    if (securityQuestion && securityAnswer) {
      updates.pin_security_question = securityQuestion
      updates.pin_security_answer_hash = securityAnswer
    }

    // Use the update_pin RPC if pin is set, otherwise direct update
    if (pin) {
      const { error: rpcError } = await supabase.rpc('update_pin', {
        p_user_id: user.id,
        p_current_pin: '',
        p_new_pin: pin,
      })
      if (rpcError) {
        setError(rpcError.message)
        setSaving(false)
        return
      }
    }

    // Save security question if provided
    if (securityQuestion && securityAnswer) {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          pin_security_question: securityQuestion,
          pin_security_answer_hash: securityAnswer,
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Failed to save security question:', updateError)
      }
    }

    setSaving(false)
    onNext()
  }

  return (
    <div className="onboarding-step">
      <h2>Set a PIN</h2>
      <p>
        A PIN adds an extra layer of security. You'll be asked for it when returning
        after 30 minutes of inactivity.
      </p>

      <form onSubmit={handleSubmit}>
        {!skip && (
          <>
            <div className="form-field">
              <label htmlFor="onboard-pin">PIN (4-6 digits)</label>
              <input
                id="onboard-pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter PIN"
              />
            </div>

            <div className="form-field">
              <label htmlFor="onboard-confirm-pin">Confirm PIN</label>
              <input
                id="onboard-confirm-pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={confirmPin}
                onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Confirm PIN"
              />
            </div>

            <details className="security-question-details">
              <summary>Add a security question (optional)</summary>
              <div className="form-field" style={{ marginTop: '0.5rem' }}>
                <label htmlFor="onboard-security-q">Question</label>
                <input
                  id="onboard-security-q"
                  type="text"
                  value={securityQuestion}
                  onChange={e => setSecurityQuestion(e.target.value)}
                  placeholder="e.g. What was your first pet's name?"
                />
              </div>
              <div className="form-field">
                <label htmlFor="onboard-security-a">Answer</label>
                <input
                  id="onboard-security-a"
                  type="text"
                  value={securityAnswer}
                  onChange={e => setSecurityAnswer(e.target.value)}
                  placeholder="Your answer"
                />
              </div>
            </details>
          </>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="onboarding-actions">
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            Back
          </button>
          <div>
            {!skip && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setSkip(true)}
                style={{ marginRight: '0.5rem' }}
              >
                Skip
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : skip ? 'Continue' : 'Set PIN'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
