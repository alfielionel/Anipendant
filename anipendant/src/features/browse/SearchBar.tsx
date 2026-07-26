import { useState, useEffect, useRef } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  loading: boolean
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const trimmed = query.trim()
    if (!trimmed) return
    const timer = setTimeout(() => onSearch(trimmed), 400)
    return () => clearTimeout(timer)
  }, [query, onSearch])

  return (
    <div className="search-bar">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search for an anime…"
        className="search-input"
      />
    </div>
  )
}
