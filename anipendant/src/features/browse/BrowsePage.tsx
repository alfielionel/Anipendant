import { useState, useCallback } from 'react'
import SearchBar from '@/features/browse/SearchBar'
import AnimeCard from '@/features/browse/AnimeCard'
import { useAnimeApi } from '@/hooks/useAnimeApi'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import type { AnimeShow } from '@/types/database'
import Loading from '@/components/Loading'

export default function BrowsePage() {
  const api = useAnimeApi()
  const { user } = useAuth()
  const [results, setResults] = useState<AnimeShow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [addedSet, setAddedSet] = useState<Set<string>>(new Set())

  const handleSearch = useCallback(
    async (query: string) => {
      setLoading(true)
      setError(null)
      setSearched(true)
      try {
        const data = await api.search(query)
        setResults(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed. Try again.')
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    [api]
  )

  async function handleAddShow(show: AnimeShow) {
    if (!user) return
    const key = `${show.source}:${show.id}`

    // Insert the show
    const { data: newShow, error: insertError } = await supabase.from('shows').insert({
      user_id: user.id,
      api_source: show.source,
      api_id: String(show.id),
      title: show.title,
      image_url: show.coverUrl,
      synopsis: show.synopsis,
    }).select().single()

    if (insertError) {
      if (insertError.code === '23505') {
        setAddedSet(prev => new Set(prev).add(key))
      }
      return
    }

    // Fetch episodes from the API and auto-import them
    try {
      const detail = await api.getById(String(show.id))
      if (detail.episodeList && detail.episodeList.length > 0 && newShow) {
        const episodeRows = detail.episodeList.map(ep => ({
          show_id: newShow.id,
          episode_number: ep.number,
          title: ep.title ?? `Episode ${ep.number}`,
        }))
        await supabase.from('episodes').insert(episodeRows)
      }
    } catch (err) {
      console.error('Failed to auto-import episodes:', err)
    }

    setAddedSet(prev => new Set(prev).add(key))
  }

  return (
    <div className="browse-page">
      <h1>Browse Anime</h1>
      <SearchBar onSearch={handleSearch} loading={loading} />

      {loading && <Loading message="Searching…" />}

      {error && <div className="error-state"><p>{error}</p></div>}

      {!loading && searched && results.length === 0 && !error && (
        <div className="empty-state">
          <p>No results found. Try a different search term.</p>
        </div>
      )}

      {!loading && !searched && (
        <div className="empty-state">
          <p>Search for an anime to get started.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="anime-grid">
          {results.map(show => (
            <AnimeCard
              key={`${show.source}-${show.id}`}
              show={show}
              onAddShow={handleAddShow}
              added={addedSet.has(`${show.source}:${show.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
