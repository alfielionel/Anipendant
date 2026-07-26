import { useState, useRef } from 'react'
import yaml from 'js-yaml'
const parseYaml = yaml.load
import { parseImportData, type ParsedImport } from '@/features/shows/import/yaml-schema'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface YamlImportProps {
  showId?: string
  onSuccess: () => void
}

export default function YamlImport({ showId, onSuccess }: YamlImportProps) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [parsed, setParsed] = useState<ParsedImport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<string | null>(null)

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setParsed(null)
    setImportResult(null)

    try {
      const text = await file.text()
      const yamlData = parseYaml(text)
      const result = parseImportData(yamlData)
      setParsed(result)
    } catch (err) {
      if (err instanceof Error) {
        setError(`Invalid YAML: ${err.message}`)
      } else {
        setError('Failed to parse YAML file')
      }
    }
  }

  async function handleImport() {
    if (!parsed || !user) return
    setImporting(true)
    setError(null)

    let importedCount = 0
    let skippedCount = 0

    for (const show of parsed.shows) {
      // Find or create show
      let targetShowId = showId

      if (!targetShowId) {
        // YAML may reference a show that doesn't exist yet
        // For now, we only support importing into an existing show
        setError('Select a show first, or import from a show detail page')
        setImporting(false)
        return
      }

      for (const ep of show.episodes) {
        // Check if episode already exists
        const { data: existing } = await supabase
          .from('episodes')
          .select('id')
          .eq('show_id', targetShowId)
          .eq('episode_number', ep.number)
          .maybeSingle()

        if (existing) {
          skippedCount++
          continue
        }

        // Insert episode
        const { data: episode, error: epError } = await supabase
          .from('episodes')
          .insert({
            show_id: targetShowId,
            episode_number: ep.number,
            title: ep.title ?? null,
          })
          .select()
          .single()

        if (epError) {
          console.error('Failed to insert episode:', epError)
          continue
        }

        // Insert mirrors
        if (ep.mirrors.length > 0 && episode) {
          const { error: mirrorError } = await supabase
            .from('episode_mirrors')
            .insert(
              ep.mirrors.map(m => ({
                episode_id: episode.id,
                url: m.url,
                label: m.label ?? null,
              }))
            )

          if (mirrorError) {
            console.error('Failed to insert mirrors:', mirrorError)
          }
        }

        importedCount++
      }
    }

    setImporting(false)
    setImportResult(
      `Imported ${importedCount} episode${importedCount !== 1 ? 's' : ''}` +
        (skippedCount > 0 ? ` (${skippedCount} skipped — already exist)` : '')
    )

    if (importedCount > 0) {
      onSuccess()
    }
  }

  return (
    <div className="yaml-import">
      <h3>Import Episodes from YAML</h3>

      <div className="file-upload-area">
        <input
          ref={fileInputRef}
          type="file"
          accept=".yaml,.yml"
          onChange={handleFileSelected}
          className="file-input"
          id="yaml-file-input"
        />
        <label htmlFor="yaml-file-input" className="file-upload-label">
          {parsed ? 'Change file' : 'Choose a YAML file to import'}
        </label>
      </div>

      {error && <p className="form-error">{error}</p>}

      {parsed && (
        <div className="import-preview">
          <h4>Import Preview</h4>
          <ul>
            {parsed.shows.map((show, i) => (
              <li key={i}>
                <strong>{show.title}</strong> — {show.episodes.length} episodes,{' '}
                {show.episodes.reduce((s, e) => s + e.mirrors.length, 0)} mirrors
              </li>
            ))}
          </ul>
          <p className="import-totals">
            Total: <strong>{parsed.totalEpisodes}</strong> episodes,{' '}
            <strong>{parsed.totalMirrors}</strong> mirrors
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleImport}
            disabled={importing}
          >
            {importing ? 'Importing…' : 'Confirm Import'}
          </button>
        </div>
      )}

      {importResult && <p className="import-result">{importResult}</p>}
    </div>
  )
}
