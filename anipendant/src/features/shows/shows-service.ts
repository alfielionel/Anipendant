import { supabase } from '@/lib/supabase'
import type { Show, Episode } from '@/types/database'

export async function fetchUserShows(userId: string): Promise<Show[]> {
  const { data } = await supabase
    .from('shows')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return (data ?? []) as Show[]
}

export async function fetchShowEpisodes(showId: string): Promise<Episode[]> {
  const { data } = await supabase
    .from('episodes')
    .select('*')
    .eq('show_id', showId)
    .order('episode_number', { ascending: true })
  return (data ?? []) as Episode[]
}

export async function fetchEpisodeMirrors(episodeId: string) {
  const { data } = await supabase
    .from('episode_mirrors')
    .select('*')
    .eq('episode_id', episodeId)
  return data ?? []
}

export async function addEpisodeToShow(
  showId: string,
  episodeNumber: number,
  title: string | null,
  mirrors: Array<{ url: string; label: string | null }>
) {
  // Insert episode
  const { data: episode, error: epError } = await supabase
    .from('episodes')
    .insert({ show_id: showId, episode_number: episodeNumber, title })
    .select()
    .single()

  if (epError) throw epError

  // Insert mirrors
  if (mirrors.length > 0 && episode) {
    const { error: mirrorError } = await supabase.from('episode_mirrors').insert(
      mirrors.map(m => ({
        episode_id: episode.id,
        url: m.url,
        label: m.label,
      }))
    )
    if (mirrorError) throw mirrorError
  }

  return episode
}

export async function deleteEpisode(episodeId: string) {
  const { error } = await supabase
    .from('episodes')
    .delete()
    .eq('id', episodeId)
  if (error) throw error
}

export async function deleteMirror(mirrorId: string) {
  const { error } = await supabase
    .from('episode_mirrors')
    .delete()
    .eq('id', mirrorId)
  if (error) throw error
}
