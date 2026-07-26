import { z } from 'zod'

const MirrorSchema = z.object({
  url: z.string().min(1, 'Mirror URL is required').url('Must be a valid URL'),
  label: z.string().optional(),
})

const EpisodeSchema = z.object({
  number: z.number().int().positive('Episode number must be positive'),
  title: z.string().optional(),
  mirrors: z
    .array(MirrorSchema)
    .min(1, 'Each episode must have at least one mirror URL'),
})

const ShowEntrySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  episodes: z.array(EpisodeSchema).min(1, 'Each show must have at least one episode'),
})

const YamlImportSchema = z.object({
  shows: z.array(ShowEntrySchema).min(1, 'At least one show is required'),
})

export type ImportedShow = z.infer<typeof ShowEntrySchema>
export type ImportedEpisode = z.infer<typeof EpisodeSchema>

export interface ParsedImport {
  shows: ImportedShow[]
  totalEpisodes: number
  totalMirrors: number
}

export function parseImportData(data: unknown): ParsedImport {
  const parsed = YamlImportSchema.parse(data)
  const totalEpisodes = parsed.shows.reduce((sum, s) => sum + s.episodes.length, 0)
  const totalMirrors = parsed.shows.reduce(
    (sum, s) => sum + s.episodes.reduce((mSum, ep) => mSum + ep.mirrors.length, 0),
    0
  )

  return {
    shows: parsed.shows,
    totalEpisodes,
    totalMirrors,
  }
}
