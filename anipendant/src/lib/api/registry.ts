import type { AnimeProvider } from '@/lib/api/types'
import { AniListAdapter } from '@/lib/api/anilist'
import { JikanAdapter } from '@/lib/api/jikan'
import { KitsuAdapter } from '@/lib/api/kitsu'

const providers: Record<string, AnimeProvider> = {
  anilist: new AniListAdapter(),
  jikan: new JikanAdapter(),
  kitsu: new KitsuAdapter(),
}

export function getProvider(type: string): AnimeProvider {
  const provider = providers[type]
  if (!provider) {
    throw new Error(`Unknown API provider: "${type}". Valid options: anilist, jikan, kitsu`)
  }
  return provider
}
