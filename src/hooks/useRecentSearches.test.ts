import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { City } from '../types'
import { useRecentSearches } from './useRecentSearches'

const cities: City[] = [
  { id: 1, name: 'Pune', state: 'Maharashtra' },
  { id: 2, name: 'Bengaluru', state: 'Karnataka' },
]

describe('useRecentSearches', () => {
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

  it('starts empty and available when storage is empty', () => {
    const { result } = renderHook(() => useRecentSearches(cities))
    expect(result.current.searches).toEqual([])
    expect(result.current.available).toBe(true)
  })

  it('save() persists a new search and surfaces it in state', () => {
    const { result } = renderHook(() => useRecentSearches(cities))

    act(() => {
      result.current.save({ fromCityId: 1, toCityId: 2, date: '2024-10-02' })
    })

    expect(result.current.searches).toEqual([{ fromCityId: 1, toCityId: 2, date: '2024-10-02' }])

    const { result: reloaded } = renderHook(() => useRecentSearches(cities))
    expect(reloaded.current.searches).toEqual([{ fromCityId: 1, toCityId: 2, date: '2024-10-02' }])
  })

  it('save() moves a repeated route to the top instead of duplicating it', () => {
    const { result } = renderHook(() => useRecentSearches(cities))

    act(() => {
      result.current.save({ fromCityId: 1, toCityId: 2, date: '2024-10-01' })
    })
    act(() => {
      result.current.save({ fromCityId: 2, toCityId: 1, date: '2024-10-02' })
    })
    act(() => {
      result.current.save({ fromCityId: 1, toCityId: 2, date: '2024-10-05' })
    })

    expect(result.current.searches).toEqual([
      { fromCityId: 1, toCityId: 2, date: '2024-10-05' },
      { fromCityId: 2, toCityId: 1, date: '2024-10-02' },
    ])
  })

  it('remove() removes an entry by index', () => {
    const { result } = renderHook(() => useRecentSearches(cities))

    act(() => {
      result.current.save({ fromCityId: 1, toCityId: 2, date: '2024-10-01' })
    })
    act(() => {
      result.current.save({ fromCityId: 2, toCityId: 1, date: '2024-10-02' })
    })
    act(() => {
      result.current.remove(0)
    })

    expect(result.current.searches).toEqual([{ fromCityId: 1, toCityId: 2, date: '2024-10-01' }])
  })

  it('clearAll() empties the list', () => {
    const { result } = renderHook(() => useRecentSearches(cities))

    act(() => {
      result.current.save({ fromCityId: 1, toCityId: 2, date: '2024-10-01' })
    })
    act(() => {
      result.current.clearAll()
    })

    expect(result.current.searches).toEqual([])
  })

  it('reports available:false when storage is broken', () => {
    store['redbus:recentSearches'] = '{not json'
    const { result } = renderHook(() => useRecentSearches(cities))

    expect(result.current.available).toBe(false)
    expect(result.current.searches).toEqual([])
  })

  it('flips available to false when a save fails to persist', () => {
    const { result } = renderHook(() => useRecentSearches(cities))

    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => {
        throw new Error('quota exceeded')
      }),
      removeItem: vi.fn(),
    })

    act(() => {
      result.current.save({ fromCityId: 1, toCityId: 2, date: '2024-10-02' })
    })

    expect(result.current.available).toBe(false)
  })
})
