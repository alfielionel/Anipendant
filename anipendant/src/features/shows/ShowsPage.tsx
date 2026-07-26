import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import ShowCard from '@/features/shows/ShowCard'
import { fetchUserShows } from '@/features/shows/shows-service'
import type { Show } from '@/types/database'
import Loading from '@/components/Loading'

export default function ShowsPage() {
  const { user } = useAuth()
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchUserShows(user.id)
      .then(setShows)
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <Loading message="Loading your shows…" />

  return (
    <div className="shows-page">
      <h1>My Shows</h1>

      {shows.length === 0 ? (
        <div className="empty-state">
          <p>No shows yet. Go browse to add some!</p>
        </div>
      ) : (
        <div className="anime-grid">
          {shows.map(show => (
            <ShowCard key={show.id} show={show} onDelete={(id) => setShows(prev => prev.filter(s => s.id !== id))} />
          ))}
        </div>
      )}
    </div>
  )
}
