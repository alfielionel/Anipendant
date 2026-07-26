import { useState, type FormEvent } from 'react'
import { addEpisodeToShow } from '@/features/shows/shows-service'

interface AddEpisodeFormProps {
  showId: string
  onSuccess: () => void
}

export default function AddEpisodeForm({ showId, onSuccess }: AddEpisodeFormProps) {
  const [episodeNumber, setEpisodeNumber] = useState('')
  const [title, setTitle] = useState('')
  const [mirrors, setMirrors] = useState<Array<{ url: string; label: string }>>([
    { url: '', label: '' },
  ])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addMirrorField() {
    setMirrors(prev => [...prev, { url: '', label: '' }])
  }

  function removeMirrorField(index: number) {
    setMirrors(prev => prev.filter((_, i) => i !== index))
  }

  function updateMirror(index: number, field: 'url' | 'label', value: string) {
    setMirrors(prev =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const num = parseInt(episodeNumber, 10)
    if (!num || num < 1) {
      setError('Episode number must be a positive integer')
      return
    }

    const validMirrors = mirrors.filter(m => m.url.trim())
    setSaving(true)

    try {
      await addEpisodeToShow(
        showId,
        num,
        title || null,
        validMirrors.map(m => ({ url: m.url, label: m.label || null }))
      )
      // Reset form
      setEpisodeNumber('')
      setTitle('')
      setMirrors([{ url: '', label: '' }])
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add episode')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="add-episode-form">
      <h3>Add Episode</h3>

      <div className="form-row">
        <div className="form-field" style={{ flex: '0 0 120px' }}>
          <label htmlFor="ep-number">Episode #</label>
          <input
            id="ep-number"
            type="number"
            min={1}
            value={episodeNumber}
            onChange={e => setEpisodeNumber(e.target.value)}
            placeholder="1"
            required
          />
        </div>
        <div className="form-field" style={{ flex: 1 }}>
          <label htmlFor="ep-title">Title (optional)</label>
          <input
            id="ep-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Episode title"
          />
        </div>
      </div>

      <div className="mirrors-section">
        <label>Mirror URLs</label>
        {mirrors.map((mirror, i) => (
          <div key={i} className="mirror-form-row">
            <input
              type="url"
              value={mirror.url}
              onChange={e => updateMirror(i, 'url', e.target.value)}
              placeholder="https://example.com/video.mp4"
              required={i === 0}
              className="mirror-url-input"
            />
            <input
              type="text"
              value={mirror.label}
              onChange={e => updateMirror(i, 'label', e.target.value)}
              placeholder="Label (e.g. 720p)"
              className="mirror-label-input"
            />
            {mirrors.length > 1 && (
              <button
                type="button"
                className="btn btn-small btn-ghost"
                onClick={() => removeMirrorField(i)}
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn btn-ghost btn-small" onClick={addMirrorField}>
          + Add another mirror
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? 'Adding…' : 'Add Episode'}
      </button>
    </form>
  )
}
