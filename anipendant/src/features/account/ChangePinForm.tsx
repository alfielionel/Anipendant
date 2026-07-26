import { useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function ChangePinForm() {
  const { user } = useAuth()
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setError(null)
    setSuccess(false)

    if (newPin.length < 4 || newPin.length > 6) {
      setError('PIN must be 4-6 digits')
      return
    }
    if (newPin !== confirmPin) {
      setError('New PINs do not match')
      return
    }

    setSaving(true)
    const { data, error: rpcError } = await supabase.rpc('update_pin', {
      p_user_id: user.id,
      p_current_pin: currentPin,
      p_new_pin: newPin,
    })

    if (rpcError) {
      setError(rpcError.message)
      setSaving(false)
      return
    }

    if (data === false) {
      setError('Current PIN is incorrect')
      setSaving(false)
      return
    }

    setSuccess(true)
    setCurrentPin('')
    setNewPin('')
    setConfirmPin('')
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="change-pin-form">
      <h3>Change PIN</h3>

      <div className="form-field">
        <label htmlFor="current-pin">Current PIN</label>
        <input
          id="current-pin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={currentPin}
          onChange={e => setCurrentPin(e.target.value.replace(/\D/g, ''))}
          placeholder="Current PIN"
        />
      </div>

      <div className="form-field">
        <label htmlFor="new-pin">New PIN (4-6 digits)</label>
        <input
          id="new-pin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={newPin}
          onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
          placeholder="New PIN"
        />
      </div>

      <div className="form-field">
        <label htmlFor="confirm-new-pin">Confirm New PIN</label>
        <input
          id="confirm-new-pin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={confirmPin}
          onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
          placeholder="Confirm new PIN"
        />
      </div>

      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">PIN updated successfully!</p>}

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? 'Updating…' : 'Update PIN'}
      </button>
    </form>
  )
}
