import { describe, it, expect } from 'vitest'
import { parseImportData } from '@/features/shows/import/yaml-schema'

const validYamlData = {
  shows: [
    {
      title: 'Cowboy Bebop',
      episodes: [
        {
          number: 1,
          title: 'Asteroid Blues',
          mirrors: [{ url: 'https://example.com/ep1.mp4', label: '720p' }],
        },
        {
          number: 2,
          mirrors: [{ url: 'https://example.com/ep2.mp4' }],
        },
      ],
    },
    {
      title: 'Samurai Champloo',
      episodes: [
        {
          number: 1,
          title: 'Tempestuous Temperaments',
          mirrors: [
            { url: 'https://example.com/sc-ep1.mp4', label: '1080p' },
            { url: 'https://backup.example.com/sc-ep1.mp4', label: 'Backup' },
          ],
        },
      ],
    },
  ],
}

describe('parseImportData', () => {
  it('parses valid YAML data correctly', () => {
    const result = parseImportData(validYamlData)
    expect(result.shows).toHaveLength(2)
    expect(result.totalEpisodes).toBe(3)
    expect(result.totalMirrors).toBe(4)
  })

  it('returns correct show titles', () => {
    const result = parseImportData(validYamlData)
    expect(result.shows[0].title).toBe('Cowboy Bebop')
    expect(result.shows[1].title).toBe('Samurai Champloo')
  })

  it('includes optional episode titles', () => {
    const result = parseImportData(validYamlData)
    expect(result.shows[0].episodes[0].title).toBe('Asteroid Blues')
  })

  it('allows episodes without titles', () => {
    const result = parseImportData(validYamlData)
    expect(result.shows[0].episodes[1].title).toBeUndefined()
  })

  it('parses mirror labels correctly', () => {
    const result = parseImportData(validYamlData)
    expect(result.shows[1].episodes[0].mirrors).toHaveLength(2)
    expect(result.shows[1].episodes[0].mirrors[0].label).toBe('1080p')
    expect(result.shows[1].episodes[0].mirrors[1].label).toBe('Backup')
  })
})

describe('parseImportData validation', () => {
  it('rejects empty shows array', () => {
    expect(() => parseImportData({ shows: [] })).toThrow()
  })

  it('rejects missing shows key', () => {
    expect(() => parseImportData({})).toThrow()
  })

  it('rejects episode without mirrors', () => {
    expect(() =>
      parseImportData({
        shows: [
          {
            title: 'Test',
            episodes: [{ number: 1, mirrors: [] }],
          },
        ],
      })
    ).toThrow()
  })

  it('rejects episode with negative number', () => {
    expect(() =>
      parseImportData({
        shows: [
          {
            title: 'Test',
            episodes: [{ number: -1, mirrors: [{ url: 'https://example.com/v.mp4' }] }],
          },
        ],
      })
    ).toThrow()
  })

  it('rejects invalid mirror URL', () => {
    expect(() =>
      parseImportData({
        shows: [
          {
            title: 'Test',
            episodes: [{ number: 1, mirrors: [{ url: 'not-a-url' }] }],
          },
        ],
      })
    ).toThrow()
  })

  it('rejects empty title', () => {
    expect(() =>
      parseImportData({
        shows: [
          {
            title: '',
            episodes: [{ number: 1, mirrors: [{ url: 'https://example.com/v.mp4' }] }],
          },
        ],
      })
    ).toThrow()
  })
})
