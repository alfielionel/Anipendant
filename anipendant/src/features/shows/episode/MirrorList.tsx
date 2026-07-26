import { useState, useEffect } from 'react'
import { fetchEpisodeMirrors, deleteMirror } from '@/features/shows/shows-service'

interface MirrorListProps {
  episodeId: string
}

interface MirrorData {
  id: string
  url: string
  label: string | null
}

export default function MirrorList({ episodeId }: MirrorListProps) {
  const [mirrors, setMirrors] = useState<MirrorData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEpisodeMirrors(episodeId).then(data => {
      setMirrors(data as MirrorData[])
      setLoading(false)
    })
  }, [episodeId])

  async function handleDelete(mirrorId: string) {
    if (!confirm('Delete this mirror?')) return
    await deleteMirror(mirrorId)
    setMirrors(prev => prev.filter(m => m.id !== mirrorId))
  }

  if (loading) return <p className="text-sm">Loading mirrors…</p>

  if (mirrors.length === 0) return <p className="text-sm text-muted">No mirrors</p>

  return (
    <ul className="mirror-list">
      {mirrors.map(mirror => (
        <li key={mirror.id} className="mirror-item">
          <a
            href={mirror.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mirror-link"
          >
            {mirror.label || mirror.url.slice(0, 50) + '…'}
          </a>
          <button
            type="button"
            className="btn btn-small btn-danger"
            onClick={() => handleDelete(mirror.id)}
            title="Delete mirror"
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  )
}
