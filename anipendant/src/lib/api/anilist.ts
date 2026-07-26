import type { AnimeProvider, AnimeShow, AnimeShowDetail, AnimeEpisode } from '@/lib/api/types'

const ANILIST_API = 'https://graphql.anilist.co'

const SEARCH_QUERY = `
query ($search: String, $page: Int) {
  Page(page: $page, perPage: 20) {
    pageInfo {
      hasNextPage
      total
    }
    media(search: $search, type: ANIME) {
      id
      title { romaji english }
      coverImage { large }
      bannerImage
      format
      episodes
      status
      averageScore
      genres
      description
    }
  }
}`

const DETAIL_QUERY = `
query ($id: Int) {
  Media(id: $id) {
    id
    title { romaji english native }
    coverImage { large }
    bannerImage
    description
    genres
    episodes
    status
    averageScore
    season
    seasonYear
    format
    relations {
      edges {
        relationType
        node {
          id
          title { romaji }
          coverImage { large }
          type
        }
      }
    }
    streamingEpisodes {
      title
      thumbnail
    }
  }
}`

const EPISODES_QUERY = `
query ($id: Int) {
  Media(id: $id) {
    episodes
    streamingEpisodes {
      title
      thumbnail
    }
  }
}`

interface AniListResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}

export class AniListAdapter implements AnimeProvider {
  async search(query: string, page = 1): Promise<AnimeShow[]> {
    const res = await this.fetchGraphQL<{ Page: { media: any[] } }>(SEARCH_QUERY, {
      search: query,
      page,
    })
    return res?.data?.Page?.media?.map(mapMediaToShow) ?? []
  }

  async getById(id: string | number): Promise<AnimeShowDetail> {
    const res = await this.fetchGraphQL<{ Media: any }>(DETAIL_QUERY, {
      id: Number(id),
    })
    const media = res?.data?.Media
    if (!media) throw new Error('Anime not found')

    return {
      ...mapMediaToShow(media),
      synopsis: media.description ?? null,
      genres: media.genres ?? [],
      relations: (media.relations?.edges ?? []).map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title?.romaji ?? 'Unknown',
        relationType: edge.relationType,
        coverUrl: edge.node.coverImage?.large ?? null,
      })),
      episodeList: generateEpisodeList(media.episodes, media.streamingEpisodes),
    }
  }

  async getEpisodes(id: string | number): Promise<AnimeEpisode[]> {
    const res = await this.fetchGraphQL<{ Media: { episodes: number; streamingEpisodes: any[] } }>(
      EPISODES_QUERY,
      { id: Number(id) }
    )
    const media = res?.data?.Media
    if (!media) return []
    return generateEpisodeList(media.episodes, media.streamingEpisodes)
  }

  private async fetchGraphQL<T>(
    query: string,
    variables: Record<string, unknown>
  ): Promise<AniListResponse<T>> {
    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query, variables }),
    })

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status}`)
    }

    return response.json()
  }
}

/**
 * Generate the full episode list from the official episode count,
 * merging in any streaming titles that exist. This ensures all episodes
 * are imported even when streamingEpisodes only returns a subset.
 */
function generateEpisodeList(
  episodeCount: number | null,
  streamingEpisodes: { title?: string | null; thumbnail?: string | null }[]
): AnimeEpisode[] {
  const count = episodeCount ?? streamingEpisodes.length
  return Array.from({ length: count }, (_, i) => ({
    number: i + 1,
    title: streamingEpisodes[i]?.title ?? null,
    thumbnail: streamingEpisodes[i]?.thumbnail ?? null,
  }))
}

/**
 * Pad an episode list to match the expected count from AniList search results.
 * This ensures that the number of episodes shown on the browse card matches
 * what actually gets imported into the library.
 */
export function padEpisodeList(
  episodeList: AnimeEpisode[],
  expectedCount: number | null
): AnimeEpisode[] {
  const target = expectedCount ?? episodeList.length
  if (episodeList.length >= target) return episodeList
  const padded = [...episodeList]
  for (let i = episodeList.length + 1; i <= target; i++) {
    padded.push({ number: i, title: `Episode ${i}`, thumbnail: null })
  }
  return padded
}

function mapMediaToShow(media: any): AnimeShow {
  return {
    id: media.id,
    title: media.title?.english ?? media.title?.romaji ?? 'Unknown',
    titleJapanese: media.title?.native ?? null,
    coverUrl: media.coverImage?.large ?? null,
    bannerUrl: media.bannerImage ?? null,
    format: media.format ?? null,
    episodes: media.episodes ?? null,
    status: media.status ?? null,
    averageScore: media.averageScore ?? null,
    source: 'anilist',
  }
}
