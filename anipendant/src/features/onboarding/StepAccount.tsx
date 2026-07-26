import { useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface StepAccountProps {
  onNext: () => void
}

export default function StepAccount({ onNext }: StepAccountProps) {
  const { user, refreshProfile } = useAuth()
  const [username, setUsername] = useState(user?.username || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setError(null)

    if (username.length < 2) {
      setError('Username must be at least 2 characters')
      return
    }

    setSaving(true)
    const { error: updateError } = await supabase
      .from('users')
      .update({ username })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    await refreshProfile()
    setSaving(false)
    onNext()
  }

  return (
    <div className="onboarding-step">
      <h2>Welcome to Anipendant!</h2>
      <p>Let's set up your profile.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="onboard-username">Username</label>
          <input
            id="onboard-username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Pick a username"
            required
            minLength={2}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Continue'}
        </button>
      </form>
    </div>
  )
}
