import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Show } from '@/types/database'

interface EditShowModalProps {
  show: Show
  onClose: () => void
  onSaved: (updated: Show) => void
}

export default function EditShowModal({ show, onClose, onSaved }: EditShowModalProps) {
  const [title, setTitle] = useState(show.title)
  const [synopsis, setSynopsis] = useState(show.synopsis ?? '')
  const [imageUrl, setImageUrl] = useState(show.image_url ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('shows')
      .update({
        title: title.trim(),
        synopsis: synopsis.trim() || null,
        image_url: imageUrl.trim() || null,
      })
      .eq('id', show.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    onSaved({
      ...show,
      title: title.trim(),
      synopsis: synopsis.trim() || null,
      image_url: imageUrl.trim() || null,
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2>Edit Show</h2>

        <div className="form-field">
          <label>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <div className="form-field">
          <label>Synopsis</label>
          <textarea
            value={synopsis}
            onChange={e => setSynopsis(e.target.value)}
            rows={4}
          />
        </div>

        <div className="form-field">
          <label>Image URL</label>
          <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || !title.trim()}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
