export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at'>
        Update: Partial<Omit<User, 'id'>>
      }
      shows: {
        Row: Show
        Insert: Omit<Show, 'id' | 'created_at'>
        Update: Partial<Omit<Show, 'id' | 'user_id'>>
      }
      episodes: {
        Row: Episode
        Insert: Omit<Episode, 'id' | 'created_at'>
        Update: Partial<Omit<Episode, 'id' | 'show_id'>>
      }
      episode_mirrors: {
        Row: EpisodeMirror
        Insert: Omit<EpisodeMirror, 'id' | 'created_at'>
        Update: Partial<Omit<EpisodeMirror, 'id' | 'episode_id'>>
      }
    }
    Functions: {
      verify_pin: {
        Args: { user_id: string; pin: string }
        Returns: boolean
      }
    }
  }
}

export interface User {
  id: string
  username: string
  email: string
  pin_hash: string | null
  pin_security_question: string | null
  pin_security_answer_hash: string | null
  selected_api: 'anilist' | 'jikan' | 'kitsu'
  last_activity: string | null
  onboarding_complete: boolean
  created_at: string
}

export interface Show {
  id: string
  user_id: string
  api_source: string
  api_id: string
  title: string
  image_url: string | null
  synopsis: string | null
  created_at: string
}

export interface Episode {
  id: string
  show_id: string
  episode_number: number
  title: string | null
  created_at: string
}

export interface EpisodeMirror {
  id: string
  episode_id: string
  url: string
  label: string | null
  created_at: string
}

// ---- Anime API unified types ----
export interface AnimeShow {
  id: string | number
  title: string
  titleJapanese?: string | null
  coverUrl: string | null
  bannerUrl?: string | null
  synopsis?: string | null
  genres?: string[]
  episodes?: number | null
  format?: string | null
  status?: string | null
  averageScore?: number | null
  source: 'anilist' | 'jikan' | 'kitsu'
}

export interface AnimeEpisode {
  number: number
  title: string | null
  thumbnail: string | null
}

export interface AnimeRelation {
  id: string | number
  title: string
  relationType: string
  coverUrl: string | null
}

export interface AnimeShowDetail extends AnimeShow {
  relations: AnimeRelation[]
  episodeList: AnimeEpisode[]
}

export interface AnimeProvider {
  search(query: string, page?: number): Promise<AnimeShow[]>
  getById(id: string | number): Promise<AnimeShowDetail>
  getEpisodes(id: string | number): Promise<AnimeEpisode[]>
}
