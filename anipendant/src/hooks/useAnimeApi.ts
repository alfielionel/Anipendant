import { useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getProvider } from '@/lib/api/registry'
import type { AnimeProvider } from '@/lib/api/types'

export function useAnimeApi(): AnimeProvider {
  const { user } = useAuth()
  const provider = useMemo(() => {
    return getProvider(user?.selected_api ?? 'anilist')
  }, [user?.selected_api])

  return provider
}
