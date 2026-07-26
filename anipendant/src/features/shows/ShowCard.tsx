import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Show } from '@/types/database'
import CardMenu from '@/components/CardMenu'
import EditShowModal from '@/components/EditShowModal'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal'

interface ShowCardProps {
  show: Show
}

export default function ShowCard({ show }: ShowCardProps) {
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [currentShow, setCurrentShow] = useState(show)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await supabase.from('episode_mirrors').delete().in(
        'episode_id',
        (await supabase.from('episodes').select('id').eq('show_id', show.id)).data?.map(e => e.id) ?? []
      )
      await supabase.from('episodes').delete().eq('show_id', show.id)
      await supabase.from('shows').delete().eq('id', show.id)
      setConfirmDelete(false)
      navigate('/shows', { replace: true })
    } catch (err) {
      console.error('Delete failed:', err)
      setDeleting(false)
    }
  }

  return (
    <>
      <Link to={`/shows/${currentShow.id}`} className="anime-card show-card">
        <div className="anime-card-image">
          {currentShow.image_url ? (
            <img src={currentShow.image_url} alt={currentShow.title} loading="lazy" />
          ) : (
            <div className="anime-card-placeholder"><span>No Image</span></div>
          )}
          <span className="anime-card-badge">{currentShow.api_source}</span>
          <CardMenu
            items={[
              { label: 'Edit Metadata', icon: '✏️', onClick: () => setEditing(true) },
              { label: 'Delete', icon: '🗑️', danger: true, onClick: () => setConfirmDelete(true) },
            ]}
          />
        </div>
        <div className="anime-card-info">
          <h3 className="anime-card-title">{currentShow.title}</h3>
        </div>
      </Link>

      {editing && (
        <EditShowModal
          show={currentShow}
          onClose={() => setEditing(false)}
          onSaved={(updated) => {
            setCurrentShow(updated)
            setEditing(false)
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmDeleteModal
          title={`Delete "${currentShow.title}"?`}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={handleDelete}
          confirming={deleting}
        >
          <p>This will permanently delete this show and all its episodes. This action cannot be undone.</p>
        </ConfirmDeleteModal>
      )}
    </>
  )
}
