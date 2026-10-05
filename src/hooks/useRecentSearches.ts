import { useCallback, useState } from 'react'
import type { City, RecentSearch } from '../types'
import {
  loadRecentSearches,
  persistRecentSearches,
  removeRecentSearchAt,
  upsertRecentSearch,
} from '../lib/recentSearches'

export interface UseRecentSearchesResult {
  searches: RecentSearch[]
  available: boolean
  save: (entry: RecentSearch) => void
  remove: (index: number) => void
  clearAll: () => void
}

export function useRecentSearches(cities: City[]): UseRecentSearchesResult {
  const [{ searches, available }, setState] = useState(() => loadRecentSearches(cities))

  const save = useCallback((entry: RecentSearch) => {
    setState((prev) => {
      const next = upsertRecentSearch(prev.searches, entry)
      const ok = persistRecentSearches(next)
      return { searches: next, available: ok }
    })
  }, [])

  const remove = useCallback((index: number) => {
    setState((prev) => {
      const next = removeRecentSearchAt(prev.searches, index)
      const ok = persistRecentSearches(next)
      return { searches: next, available: ok }
    })
  }, [])

  const clearAll = useCallback(() => {
    const ok = persistRecentSearches([])
    setState({ searches: [], available: ok })
  }, [])

  return { searches, available, save, remove, clearAll }
}

export default useRecentSearches
