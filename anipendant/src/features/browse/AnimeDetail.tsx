import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAnimeApi } from '@/hooks/useAnimeApi'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { padEpisodeList } from '@/lib/api/anilist'
import type { AnimeShowDetail } from '@/types/database'
import Loading from '@/components/Loading'

export default function AnimeDetail() {
  const { id } = useParams<{ id: string }>()
  const api = useAnimeApi()
  const { user } = useAuth()
  const [detail, setDetail] = useState<AnimeShowDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  // Parse the composite id: "source:externalId"
  const [source, externalId] = id?.split(':') ?? []

  useEffect(() => {
    if (!externalId) return
    setLoading(true)
    setError(null)
    api
      .getById(externalId)
      .then(data => {
        setDetail(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message || 'Failed to load anime details')
        setLoading(false)
      })
  }, [externalId, api])

  async function handleAddShow() {
    if (!user || !detail || !source) return
    setAdding(true)

    // Insert the show
    const { data: show, error: insertError } = await supabase.from('shows').insert({
      user_id: user.id,
      api_source: detail.source,
      api_id: String(detail.id),
      title: detail.title,
      image_url: detail.coverUrl,
      synopsis: detail.synopsis,
    }).select().single()

    if (insertError) {
      if (insertError.code === '23505') {
        // Duplicate: already added
        setAdded(true)
      }
      setAdding(false)
      return
    }

    // Auto-add all episodes (no mirrors yet — user adds links manually)
    if (detail.episodeList && detail.episodeList.length > 0 && show) {
      const list = padEpisodeList(detail.episodeList, detail.episodes)
      const episodeRows = list.map(ep => ({
        show_id: show.id,
        episode_number: ep.number,
        title: ep.title ?? `Episode ${ep.number}`,
      }))

      const { error: epError } = await supabase.from('episodes').insert(episodeRows)
      if (epError) {
        console.error('Failed to insert episodes:', epError)
      }
    }

    setAdded(true)
    setAdding(false)
  }

  if (loading) return <Loading message="Loading anime details…" />
  if (error) return <div className="error-state"><p>{error}</p><Link to="/browse">Back to Browse</Link></div>
  if (!detail) return null

  return (
    <div className="anime-detail">
      <Link to="/browse" className="back-link">← Back to Browse</Link>

      {/* Hero section */}
      <div
        className="anime-detail-hero"
        style={
          detail.bannerUrl
            ? { backgroundImage: `url(${detail.bannerUrl})` }
            : undefined
        }
      >
        <div className="anime-detail-hero-content">
          <div className="anime-detail-cover">
            {detail.coverUrl ? (
              <img src={detail.coverUrl} alt={detail.title} />
            ) : (
              <div className="anime-card-placeholder"><span>No Image</span></div>
            )}
          </div>
          <div className="anime-detail-header">
            <h1>{detail.title}</h1>
            {detail.titleJapanese && (
              <p className="anime-detail-title-jp">{detail.titleJapanese}</p>
            )}
            <div className="anime-detail-meta">
              {detail.format && <span className="tag">{detail.format}</span>}
              {detail.episodes && <span className="tag">{detail.episodes} episodes</span>}
              {detail.status && <span className="tag">{detail.status.replace(/_/g, ' ')}</span>}
              {detail.averageScore && (
                <span className="tag score">{detail.averageScore}%</span>
              )}
            </div>
            <button
              type="button"
              className={`btn ${added ? 'btn-success' : 'btn-primary'}`}
              onClick={handleAddShow}
              disabled={adding || added}
            >
              {adding ? 'Adding…' : added ? 'Added ✓' : 'Add to My Shows'}
            </button>
          </div>
        </div>
      </div>

      {/* Synopsis */}
      {detail.synopsis && (
        <section className="anime-detail-section">
          <h2>Synopsis</h2>
          <p className="anime-detail-synopsis">
            {detail.synopsis.replace(/<[^>]*>/g, '')}
          </p>
        </section>
      )}

      {/* Genres */}
      {detail.genres && detail.genres.length > 0 && (
        <section className="anime-detail-section">
          <h2>Genres</h2>
          <div className="genre-tags">
            {detail.genres.map(g => (
              <span key={g} className="tag genre-tag">{g}</span>
            ))}
          </div>
        </section>
      )}

      {/* Episodes */}
      {detail.episodeList && detail.episodeList.length > 0 && (
        <section className="anime-detail-section">
          <h2>Episodes</h2>
          <div className="episode-grid">
            {detail.episodeList.map((ep, i) => (
              <div key={i} className="episode-item">
                {ep.thumbnail && (
                  <img src={ep.thumbnail} alt="" className="episode-thumb" />
                )}
                <div className="episode-info">
                  <span className="episode-number">Episode {ep.number}</span>
                  <span className="episode-title">{ep.title ?? `Episode ${ep.number}`}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Relations */}
      {detail.relations && detail.relations.length > 0 && (
        <section className="anime-detail-section">
          <h2>Related Series</h2>
          <div className="relations-list">
            {detail.relations.map((rel, i) => (
              <div key={i} className="relation-item">
                {rel.coverUrl && <img src={rel.coverUrl} alt="" className="relation-cover" />}
                <div className="relation-info">
                  <span className="relation-title">{rel.title}</span>
                  <span className="relation-type">{rel.relationType}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
