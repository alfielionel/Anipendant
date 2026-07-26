import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

const API_OPTIONS = [
  { id: 'anilist' as const, name: 'AniList', description: 'Comprehensive GraphQL API' },
  { id: 'kitsu' as const, name: 'Kitsu', description: 'Community anime database' },
]

export default function ChangeApiForm() {
  const { user, refreshProfile } = useAuth()
  const [selected, setSelected] = useState(user?.selected_api ?? 'anilist')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSave() {
    if (!user || selected === user.selected_api) return
    setSaving(true)
    setError(null)
    setSuccess(false)

    const { error: updateError } = await supabase
      .from('users')
      .update({ selected_api: selected })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    await refreshProfile()
    setSuccess(true)
    setSaving(false)
  }

  return (
    <div className="change-api-form">
      <h3>Anime API Provider</h3>
      <p className="text-muted">
        Changes take effect immediately when browsing. You can switch at any time.
      </p>

      <div className="api-choices api-choices-small">
        {API_OPTIONS.map(option => (
          <button
            key={option.id}
            type="button"
            className={`api-choice-card ${selected === option.id ? 'selected' : ''}`}
            onClick={() => {
              setSelected(option.id)
              setSuccess(false)
            }}
          >
            <span className="api-choice-name">{option.name}</span>
            <span className="api-choice-desc">{option.description}</span>
          </button>
        ))}
      </div>

      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">API provider updated!</p>}

      <button
        type="button"
        className="btn btn-primary"
        onClick={handleSave}
        disabled={saving || selected === user?.selected_api}
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  )
}
