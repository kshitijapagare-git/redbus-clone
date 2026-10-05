import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { City, RecentSearch } from '../types'
import {
  RECENT_SEARCHES_STORAGE_KEY,
  MAX_RECENT_SEARCHES,
  formatRecentSearchDate,
  isPastDate,
  loadRecentSearches,
  parseStoredSearches,
  persistRecentSearches,
  removeRecentSearchAt,
  toDateKey,
  upsertRecentSearch,
} from './recentSearches'

const cities: City[] = [
  { id: 1, name: 'Pune', state: 'Maharashtra' },
  { id: 2, name: 'Bengaluru', state: 'Karnataka' },
]

const makeEntry = (fromCityId: number, toCityId: number, date = '2024-10-02'): RecentSearch => ({
  fromCityId,
  toCityId,
  date,
})

describe('toDateKey', () => {
  it('formats a date as YYYY-MM-DD using local calendar parts', () => {
    expect(toDateKey(new Date(2024, 9, 2))).toBe('2024-10-02')
  })
})

describe('isPastDate', () => {
  it('returns true when the stored date is strictly before today', () => {
    expect(isPastDate('2024-10-01', new Date(2024, 9, 2))).toBe(true)
  })

  it('returns false when the stored date is today', () => {
    expect(isPastDate('2024-10-02', new Date(2024, 9, 2))).toBe(false)
  })

  it('returns false when the stored date is in the future', () => {
    expect(isPastDate('2024-10-03', new Date(2024, 9, 2))).toBe(false)
  })
})

describe('parseStoredSearches', () => {
  it('returns an empty array for null', () => {
    expect(parseStoredSearches(null)).toEqual([])
  })

  it('returns an empty array for invalid JSON', () => {
    expect(parseStoredSearches('{not json')).toEqual([])
  })

  it('returns an empty array when the parsed value is not an array', () => {
    expect(parseStoredSearches(JSON.stringify({ foo: 'bar' }))).toEqual([])
  })

  it('drops entries missing required fields', () => {
    const raw = JSON.stringify([makeEntry(1, 2), { fromCityId: 1 }, 'nonsense'])
    expect(parseStoredSearches(raw)).toEqual([makeEntry(1, 2)])
  })
})

describe('upsertRecentSearch', () => {
  it('adds a new route to the front', () => {
    const result = upsertRecentSearch([], makeEntry(1, 2))
    expect(result).toEqual([makeEntry(1, 2)])
  })

  it('moves a repeated route to the top instead of duplicating it', () => {
    const existing = [makeEntry(1, 2, '2024-10-01'), makeEntry(2, 1, '2024-10-02')]
    const result = upsertRecentSearch(existing, makeEntry(1, 2, '2024-10-05'))
    expect(result).toEqual([makeEntry(1, 2, '2024-10-05'), makeEntry(2, 1, '2024-10-02')])
  })

  it('never keeps more than MAX_RECENT_SEARCHES entries', () => {
    let searches: RecentSearch[] = []
    for (let i = 0; i < MAX_RECENT_SEARCHES + 3; i++) {
      searches = upsertRecentSearch(searches, makeEntry(i, i + 100))
    }
    expect(searches).toHaveLength(MAX_RECENT_SEARCHES)
    // newest added is first
    expect(searches[0]).toEqual(makeEntry(MAX_RECENT_SEARCHES + 2, MAX_RECENT_SEARCHES + 102))
  })
})

describe('removeRecentSearchAt', () => {
  it('removes exactly the entry at the given index, preserving order of the rest', () => {
    const searches = [makeEntry(1, 2), makeEntry(3, 4), makeEntry(5, 6)]
    const result = removeRecentSearchAt(searches, 1)
    expect(result).toEqual([makeEntry(1, 2), makeEntry(5, 6)])
  })
})

describe('formatRecentSearchDate', () => {
  it('formats a date key as "DD Mon"', () => {
    expect(formatRecentSearchDate('2024-10-02')).toBe('02 Oct')
  })
})

describe('loadRecentSearches / persistRecentSearches', () => {
  let store: Record<string, string>

  beforeEach(() => {
    store = {}
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => (key in store ? store[key] : null)),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key]
      }),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('saves and loads a new route', () => {
    const ok = persistRecentSearches([makeEntry(1, 2)])
    expect(ok).toBe(true)
    const result = loadRecentSearches(cities)
    expect(result).toEqual({ searches: [makeEntry(1, 2)], available: true })
  })

  it('drops entries referencing a city that no longer exists, without throwing', () => {
    store[RECENT_SEARCHES_STORAGE_KEY] = JSON.stringify([makeEntry(1, 2), makeEntry(1, 999)])
    const result = loadRecentSearches(cities)
    expect(result).toEqual({ searches: [makeEntry(1, 2)], available: true })
  })

  it('returns available:false and empty searches when getItem throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => {
        throw new Error('boom')
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })
    expect(loadRecentSearches(cities)).toEqual({ searches: [], available: false })
  })

  it('returns available:false when stored data is not JSON', () => {
    store[RECENT_SEARCHES_STORAGE_KEY] = '{not json'
    expect(loadRecentSearches(cities)).toEqual({ searches: [], available: false })
  })

  it('returns available:false when stored data is not an array', () => {
    store[RECENT_SEARCHES_STORAGE_KEY] = JSON.stringify({ foo: 'bar' })
    expect(loadRecentSearches(cities)).toEqual({ searches: [], available: false })
  })

  it('returns available:false when an entry is missing required fields', () => {
    store[RECENT_SEARCHES_STORAGE_KEY] = JSON.stringify([{ fromCityId: 1 }])
    expect(loadRecentSearches(cities)).toEqual({ searches: [], available: false })
  })

  it('returns false from persistRecentSearches when setItem throws, without throwing itself', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => {
        throw new Error('quota exceeded')
      }),
      removeItem: vi.fn(),
    })
    expect(persistRecentSearches([makeEntry(1, 2)])).toBe(false)
  })

  it('never logs to the console on any broken-storage path', () => {
    const logSpy = vi.spyOn(console, 'log')
    const warnSpy = vi.spyOn(console, 'warn')
    const errorSpy = vi.spyOn(console, 'error')

    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => {
        throw new Error('boom')
      }),
      setItem: vi.fn(() => {
        throw new Error('boom')
      }),
      removeItem: vi.fn(),
    })

    parseStoredSearches('{not json')
    loadRecentSearches(cities)
    persistRecentSearches([makeEntry(1, 2)])

    expect(logSpy).not.toHaveBeenCalled()
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })
})
