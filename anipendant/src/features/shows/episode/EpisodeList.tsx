import EpisodeRow from '@/features/shows/episode/EpisodeRow'
import type { Episode } from '@/types/database'

interface EpisodeListProps {
  showId: string
  episodes: Episode[]
  onEpisodesChange: (episodes: Episode[]) => void
}

export default function EpisodeList({ episodes, onEpisodesChange }: EpisodeListProps) {
  function handleDeleted(episodeId: string) {
    onEpisodesChange(episodes.filter(ep => ep.id !== episodeId))
  }

  if (episodes.length === 0) {
    return (
      <div className="empty-state">
        <p>No episodes yet. Add one or import from a YAML file!</p>
      </div>
    )
  }

  return (
    <div className="episode-list">
      {episodes.map(ep => (
        <EpisodeRow key={ep.id} episode={ep} onDeleted={handleDeleted} />
      ))}
    </div>
  )
}
