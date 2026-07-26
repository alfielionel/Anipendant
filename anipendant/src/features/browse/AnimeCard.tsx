import { type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import type { AnimeShow } from '@/types/database'

interface AnimeCardProps {
  show: AnimeShow
  onAddShow?: (show: AnimeShow) => void
  added?: boolean
}

export default function AnimeCard({ show, onAddShow, added }: AnimeCardProps) {
  function handleAdd(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    onAddShow?.(show)
  }

  return (
    <Link to={`/browse/${show.source}:${show.id}`} className="anime-card">
      <div className="anime-card-image">
        {show.coverUrl ? (
          <img
            src={show.coverUrl}
            alt={show.title}
            loading="lazy"
            onError={e => {
              (e.target as HTMLImageElement).src = '/placeholder.svg'
            }}
          />
        ) : (
          <div className="anime-card-placeholder">
            <span>No Image</span>
          </div>
        )}
        {show.format && <span className="anime-card-badge">{show.format}</span>}
      </div>
      <div className="anime-card-info">
        <h3 className="anime-card-title">{show.title}</h3>
        <div className="anime-card-meta">
          {show.episodes && <span>{show.episodes} ep</span>}
          {show.averageScore && (
            <span className="anime-card-score">{show.averageScore}%</span>
          )}
        </div>
        {onAddShow && (
          <button
            type="button"
            className={`btn btn-primary btn-small anime-card-add-btn${added ? ' added' : ''}`}
            onClick={handleAdd}
            disabled={added}
          >
            {added ? '✓ Added' : 'Add Show'}
          </button>
        )}
      </div>
    </Link>
  )
}
