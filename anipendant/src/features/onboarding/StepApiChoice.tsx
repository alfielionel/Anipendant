import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

const API_OPTIONS = [
  {
    id: 'anilist' as const,
    name: 'AniList',
    description: 'Comprehensive anime database with GraphQL API. Recommended for the widest selection and fastest results.',
    recommended: true,
  },
  {
    id: 'kitsu' as const,
    name: 'Kitsu',
    description: 'Community-driven anime platform with detailed episode tracking and user ratings.',
    recommended: false,
  },
]

type ApiId = typeof API_OPTIONS[number]['id']

interface StepApiChoiceProps {
  onComplete: () => void
  onBack: () => void
}

export default function StepApiChoice({ onComplete, onBack }: StepApiChoiceProps) {
  const { user, refreshProfile } = useAuth()
  const [selected, setSelected] = useState<ApiId>('anilist')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFinish() {
    if (!user) return
    setSaving(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('users')
      .update({
        selected_api: selected,
        onboarding_complete: true,
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    await refreshProfile()
    setSaving(false)
    onComplete()
  }

  return (
    <div className="onboarding-step">
      <h2>Choose Your Anime API</h2>
      <p>
        This API will be used to search and browse anime. You can change it later in
        Account settings.
      </p>

      <div className="api-choices">
        {API_OPTIONS.map(option => (
          <button
            key={option.id}
            type="button"
            className={`api-choice-card ${selected === option.id ? 'selected' : ''}`}
            onClick={() => setSelected(option.id)}
          >
            <div className="api-choice-header">
              <span className="api-choice-name">{option.name}</span>
              {option.recommended && (
                <span className="api-choice-badge">Recommended</span>
              )}
            </div>
            <p className="api-choice-desc">{option.description}</p>
          </button>
        ))}
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="onboarding-actions">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleFinish}
          disabled={saving}
        >
          {saving ? 'Setting up…' : "Let's Go!"}
        </button>
      </div>
    </div>
  )
}
