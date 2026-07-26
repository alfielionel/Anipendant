import { useState } from 'react'
import type { Episode } from '@/types/database'
import MirrorList from '@/features/shows/episode/MirrorList'
import { deleteEpisode } from '@/features/shows/shows-service'

interface EpisodeRowProps {
  episode: Episode
  onDeleted: (episodeId: string) => void
}

export default function EpisodeRow({ episode, onDeleted }: EpisodeRowProps) {
  const [expanded, setExpanded] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete Episode ${episode.episode_number}?`)) return
    await deleteEpisode(episode.id)
    onDeleted(episode.id)
  }

  return (
    <div className={`episode-row ${expanded ? 'expanded' : ''}`}>
      <div className="episode-row-header" onClick={() => setExpanded(!expanded)}>
        <span className="episode-row-number">Ep {episode.episode_number}</span>
        <span className="episode-row-title">
          {episode.title || `Episode ${episode.episode_number}`}
        </span>
        <div className="episode-row-actions">
          <button
            type="button"
            className="btn btn-small btn-ghost"
            onClick={e => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
          >
            {expanded ? '▲' : '▼'}
          </button>
          <button
            type="button"
            className="btn btn-small btn-danger"
            onClick={e => {
              e.stopPropagation()
              handleDelete()
            }}
          >
            ×
          </button>
        </div>
      </div>
      {expanded && (
        <div className="episode-row-mirrors">
          <MirrorList episodeId={episode.id} />
        </div>
      )}
    </div>
  )
}
