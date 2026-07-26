import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AnimeCard from '@/features/browse/AnimeCard'
import type { AnimeShow } from '@/types/database'

const mockShow: AnimeShow = {
  id: 1,
  title: 'Cowboy Bebop',
  coverUrl: 'https://example.com/cover.jpg',
  format: 'TV',
  episodes: 26,
  averageScore: 95,
  source: 'anilist',
}

describe('AnimeCard', () => {
  it('renders the anime title', () => {
    render(
      <BrowserRouter>
        <AnimeCard show={mockShow} />
      </BrowserRouter>
    )
    expect(screen.getByText('Cowboy Bebop')).toBeInTheDocument()
  })

  it('shows episode count', () => {
    render(
      <BrowserRouter>
        <AnimeCard show={mockShow} />
      </BrowserRouter>
    )
    expect(screen.getByText('26 ep')).toBeInTheDocument()
  })

  it('shows score percentage', () => {
    render(
      <BrowserRouter>
        <AnimeCard show={mockShow} />
      </BrowserRouter>
    )
    expect(screen.getByText('95%')).toBeInTheDocument()
  })

  it('shows format badge', () => {
    render(
      <BrowserRouter>
        <AnimeCard show={mockShow} />
      </BrowserRouter>
    )
    expect(screen.getByText('TV')).toBeInTheDocument()
  })

  it('links to the correct detail page', () => {
    render(
      <BrowserRouter>
        <AnimeCard show={mockShow} />
      </BrowserRouter>
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/browse/anilist:1')
  })
})
