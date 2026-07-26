import type { AnimeProvider, AnimeShow, AnimeShowDetail, AnimeEpisode } from '@/lib/api/types'

const JIKAN_API = 'https://api.jikan.moe/v4'

// Rate limiting: max 1 request per 500ms to stay under 3 req/s limit
let lastRequestTime = 0

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < 400) {
    await new Promise(resolve => setTimeout(resolve, 400 - timeSinceLastRequest))
  }
  lastRequestTime = Date.now()
  const response = await fetch(url)
  if (response.status === 429) {
    // Rate limited: wait 1s and retry once
    await new Promise(resolve => setTimeout(resolve, 1000))
    return fetch(url)
  }
  return response
}

export class JikanAdapter implements AnimeProvider {
  async search(query: string, page = 1): Promise<AnimeShow[]> {
    const url = `${JIKAN_API}/anime?q=${encodeURIComponent(query)}&page=${page}&limit=20`
    const res = await rateLimitedFetch(url)
    if (!res.ok) throw new Error(`Jikan API error: ${res.status}`)
    const json = await res.json()
    return (json.data ?? []).map(mapJikanAnimeToShow)
  }

  async getById(id: string | number): Promise<AnimeShowDetail> {
    const url = `${JIKAN_API}/anime/${id}/full`
    const res = await rateLimitedFetch(url)
    if (!res.ok) throw new Error(`Jikan API error: ${res.status}`)
    const json = await res.json()
    const anime = json.data
    if (!anime) throw new Error('Anime not found')

    // Fetch episodes and relations in parallel
    const [episodesRes, relationsRes] = await Promise.all([
      rateLimitedFetch(`${JIKAN_API}/anime/${id}/episodes`).catch(() => null),
      rateLimitedFetch(`${JIKAN_API}/anime/${id}/relations`).catch(() => null),
    ])

    const episodesData = episodesRes ? await episodesRes.json().catch(() => null) : null
    const relationsData = relationsRes ? await relationsRes.json().catch(() => null) : null

    return {
      ...mapJikanAnimeToShow(anime),
      synopsis: anime.synopsis ?? null,
      genres: (anime.genres ?? []).map((g: any) => g.name),
      relations: (relationsData?.data ?? []).map((rel: any) => ({
        id: rel.entry?.[0]?.mal_id ?? 0,
        title: rel.entry?.[0]?.name ?? 'Unknown',
        relationType: rel.relation ?? 'Unknown',
        coverUrl: null,
      })),
      episodeList: (episodesData?.data ?? []).map((ep: any) => ({
        number: ep.mal_id ?? 0,
        title: ep.title ?? null,
        thumbnail: ep.images?.jpg?.image_url ?? null,
      })),
    }
  }

  async getEpisodes(id: string | number): Promise<AnimeEpisode[]> {
    const url = `${JIKAN_API}/anime/${id}/episodes`
    const res = await rateLimitedFetch(url)
    if (!res.ok) throw new Error(`Jikan API error: ${res.status}`)
    const json = await res.json()
    return (json.data ?? []).map((ep: any) => ({
      number: ep.mal_id ?? 0,
      title: ep.title ?? null,
      thumbnail: ep.images?.jpg?.image_url ?? null,
    }))
  }
}

function mapJikanAnimeToShow(anime: any): AnimeShow {
  return {
    id: anime.mal_id,
    title: anime.title_english ?? anime.title ?? 'Unknown',
    titleJapanese: anime.title_japanese ?? null,
    coverUrl: anime.images?.jpg?.large_image_url ?? anime.images?.webp?.large_image_url ?? null,
    bannerUrl: null,
    format: anime.type ?? null,
    episodes: anime.episodes ?? null,
    status: anime.status ?? null,
    averageScore: anime.score ? Math.round(anime.score * 10) : null,
    source: 'jikan',
  }
}
