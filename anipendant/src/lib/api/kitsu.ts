import type { AnimeProvider, AnimeShow, AnimeShowDetail, AnimeEpisode } from '@/lib/api/types'

const KITSU_API = 'https://kitsu.io/api/edge'

export class KitsuAdapter implements AnimeProvider {
  async search(query: string, page = 1): Promise<AnimeShow[]> {
    const offset = (page - 1) * 20
    const url = `${KITSU_API}/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=20&page[offset]=${offset}`
    const res = await fetch(url, {
      headers: { Accept: 'application/vnd.api+json' },
    })
    if (!res.ok) {
      if (res.status === 403) {
        throw new Error('Kitsu API is temporarily unavailable from your network')
      }
      throw new Error(`Kitsu API error: ${res.status}`)
    }
    const json = await res.json()
    return (json.data ?? []).map(mapKitsuAnimeToShow)
  }

  async getById(id: string | number): Promise<AnimeShowDetail> {
    // Try to fetch anime, episodes, and media relations in parallel
    const [animeRes, episodesRes, relationsRes] = await Promise.all([
      fetch(`${KITSU_API}/anime/${id}`, {
        headers: { Accept: 'application/vnd.api+json' },
      }),
      fetch(`${KITSU_API}/anime/${id}/episodes?page[limit]=1000`, {
        headers: { Accept: 'application/vnd.api+json' },
      }).catch(() => null),
      fetch(`${KITSU_API}/anime/${id}/media-relations?include=destination`, {
        headers: { Accept: 'application/vnd.api+json' },
      }).catch(() => null),
    ])

    if (!animeRes.ok) throw new Error(`Kitsu API error: ${animeRes.status}`)
    const animeJson = await animeRes.json()
    const anime = animeJson.data
    if (!anime) throw new Error('Anime not found')

    const episodesJson = episodesRes ? await episodesRes.json().catch(() => null) : null
    const relationsJson = relationsRes ? await relationsRes.json().catch(() => null) : null

    return {
      ...mapKitsuAnimeToShow(anime),
      synopsis: anime.attributes?.synopsis ?? null,
      genres: [], // Kitsu uses categories, not genres directly
      relations: (relationsJson?.included ?? []).map((inc: any) => ({
        id: inc.id,
        title: inc.attributes?.slug ?? inc.attributes?.canonicalTitle ?? 'Unknown',
        relationType: (relationsJson?.data ?? []).find(
          (r: any) => r.relationships?.destination?.data?.id === inc.id
        )?.attributes?.role ?? 'Related',
        coverUrl: null,
      })),
      episodeList: (episodesJson?.data ?? []).map((ep: any) => ({
        number: ep.attributes?.number ?? 0,
        title: ep.attributes?.canonicalTitle ?? null,
        thumbnail: ep.attributes?.thumbnail?.original ?? null,
      })),
    }
  }

  async getEpisodes(id: string | number): Promise<AnimeEpisode[]> {
    const url = `${KITSU_API}/anime/${id}/episodes?page[limit]=1000`
    const res = await fetch(url, {
      headers: { Accept: 'application/vnd.api+json' },
    })
    if (!res.ok) throw new Error(`Kitsu API error: ${res.status}`)
    const json = await res.json()
    return (json.data ?? []).map((ep: any) => ({
      number: ep.attributes?.number ?? 0,
      title: ep.attributes?.canonicalTitle ?? null,
      thumbnail: ep.attributes?.thumbnail?.original ?? null,
    }))
  }
}

function mapKitsuAnimeToShow(anime: any): AnimeShow {
  const attrs = anime.attributes ?? {}
  return {
    id: anime.id,
    title: attrs.canonicalTitle ?? attrs.titles?.en ?? attrs.titles?.en_jp ?? 'Unknown',
    titleJapanese: attrs.titles?.ja_jp ?? null,
    coverUrl:
      attrs.posterImage?.large ?? attrs.posterImage?.original ?? attrs.posterImage?.medium ?? null,
    bannerUrl: attrs.coverImage?.large ?? null,
    format: attrs.showType ?? null,
    episodes: attrs.episodeCount ?? null,
    status: attrs.status ?? null,
    averageScore: attrs.averageRating ? Math.round(parseFloat(attrs.averageRating)) : null,
    source: 'kitsu',
  }
}
