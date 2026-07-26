import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Show } from '@/types/database'
import EpisodeList from '@/features/shows/episode/EpisodeList'
import AddEpisodeForm from '@/features/shows/episode/AddEpisodeForm'
import YamlImport from '@/features/shows/import/YamlImport'
import { fetchShowEpisodes } from '@/features/shows/shows-service'
import CardMenu from '@/components/CardMenu'
import EditShowModal from '@/components/EditShowModal'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal'
import Loading from '@/components/Loading'

export default function ShowDetail() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [show, setShow] = useState<Show | null>(null)
  const [episodes, setEpisodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'episodes' | 'add' | 'import'>('episodes')
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Get show id from URL
  const showId = window.location.pathname.split('/shows/')[1]

  useEffect(() => {
    if (!showId || !user) return

    supabase
      .from('shows')
      .select('*')
      .eq('id', showId)
      .eq('user_id', user.id)
      .single()
      .then(async ({ data, error: fetchError }) => {
        if (fetchError || !data) {
          setError('Show not found')
          setLoading(false)
          return
        }
        setShow(data as Show)
        const eps = await fetchShowEpisodes(data.id)
        setEpisodes(eps)
        setLoading(false)
      })
  }, [showId, user])

  async function handleDelete() {
    if (!show) return
    setDeleting(true)
    await supabase.from('episode_mirrors').delete().in(
      'episode_id',
      (await supabase.from('episodes').select('id').eq('show_id', show.id)).data?.map(e => e.id) ?? []
    )
    await supabase.from('episodes').delete().eq('show_id', show.id)
    await supabase.from('shows').delete().eq('id', show.id)
    navigate('/shows', { replace: true })
  }

  function handleEpisodeAdded() {
    if (show) {
      fetchShowEpisodes(show.id).then(setEpisodes)
      setTab('episodes')
    }
  }

  if (loading) return <Loading message="Loading show…" />
  if (error || !show) return (
    <div className="error-state">
      <p>{error || 'Show not found'}</p>
      <Link to="/shows">Back to My Shows</Link>
    </div>
  )

  return (
    <div className="anime-detail">
      <Link to="/shows" className="back-link">← My Shows</Link>

      {/* Hero section — same styling as browse detail */}
      <div
        className="anime-detail-hero"
        style={
          show.image_url
            ? { backgroundImage: `url(${show.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center 20%' }
            : undefined
        }
      >
        <div className="anime-detail-hero-content">
          <div className="anime-detail-cover">
            {show.image_url ? (
              <img src={show.image_url} alt={show.title} />
            ) : (
              <div className="anime-card-placeholder"><span>No Image</span></div>
            )}
          </div>
          <div className="anime-detail-header">
            <h1>{show.title}</h1>
            <div className="anime-detail-meta">
              <span className="tag">{show.api_source}</span>
              <span className="tag">{episodes.length} episodes</span>
            </div>
            <CardMenu
              items={[
                { label: 'Edit Metadata', icon: '✏️', onClick: () => setEditing(true) },
                { label: 'Delete', icon: '🗑️', danger: true, onClick: () => setConfirmDelete(true) },
              ]}
            />
          </div>
        </div>
      </div>

      {show.synopsis && (
        <section className="anime-detail-section">
          <h2>Synopsis</h2>
          <p className="anime-detail-synopsis">{show.synopsis}</p>
        </section>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          type="button"
          className={`tab ${tab === 'episodes' ? 'active' : ''}`}
          onClick={() => setTab('episodes')}
        >
          Episodes ({episodes.length})
        </button>
        <button
          type="button"
          className={`tab ${tab === 'add' ? 'active' : ''}`}
          onClick={() => setTab('add')}
        >
          Add Episode
        </button>
        <button
          type="button"
          className={`tab ${tab === 'import' ? 'active' : ''}`}
          onClick={() => setTab('import')}
        >
          Import YAML
        </button>
      </div>

      <div className="tab-content">
        {tab === 'episodes' && (
          <EpisodeList showId={show.id} episodes={episodes} onEpisodesChange={setEpisodes} />
        )}
        {tab === 'add' && (
          <AddEpisodeForm showId={show.id} onSuccess={handleEpisodeAdded} />
        )}
        {tab === 'import' && (
          <YamlImport showId={show.id} onSuccess={handleEpisodeAdded} />
        )}
      </div>

      {editing && show && (
        <EditShowModal
          show={show}
          onClose={() => setEditing(false)}
          onSaved={(updated) => {
            setShow(updated)
            setEditing(false)
          }}
        />
      )}

      {confirmDelete && show && (
        <ConfirmDeleteModal
          title={`Delete "${show.title}"?`}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={handleDelete}
          confirming={deleting}
        >
          <p>This will permanently delete this show and all its episodes. This action cannot be undone.</p>
        </ConfirmDeleteModal>
      )}
    </div>
  )
}
