import { useCallback, useEffect, useMemo, useState } from 'react'
import { cities } from '../data'
import {
  buildBusSearchParams,
  parseBusSearchParams,
  type BusTypeToken,
  type ParsedBusSearchParams,
  type SortKey,
  type TimeBucket,
} from '../lib/busSearchParams'

export interface BusSearchFilterState {
  type: Set<BusTypeToken>
  time: TimeBucket | null
  fareMin: number | null
  fareMax: number | null
  women: boolean
  sort: SortKey
}

export interface UseBusSearchFiltersResult {
  routeError: string | null
  fromCityId: number | null
  toCityId: number | null
  date: string | null
  committed: BusSearchFilterState
  draft: BusSearchFilterState
  warnings: string[]
  setType: (t: Set<BusTypeToken>) => void
  setTime: (t: TimeBucket | null) => void
  setFareRange: (min: number, max: number) => void
  setWomen: (v: boolean) => void
  setSort: (s: SortKey) => void
  applyDraft: () => void
  resetDraft: () => void
  clearFilters: () => void
}

const DEFAULT_FILTERS: BusSearchFilterState = {
  type: new Set(),
  time: null,
  fareMin: null,
  fareMax: null,
  women: false,
  sort: 'departure',
}

function readParsed(): ParsedBusSearchParams {
  return parseBusSearchParams(window.location.search, cities)
}

function filtersFromParsed(parsed: ParsedBusSearchParams): BusSearchFilterState {
  return {
    type: parsed.type,
    time: parsed.time,
    fareMin: parsed.fareMin,
    fareMax: parsed.fareMax,
    women: parsed.women,
    sort: parsed.sort,
  }
}

function writeFilters(base: ParsedBusSearchParams, next: BusSearchFilterState): void {
  const nextParsed: ParsedBusSearchParams = { ...base, ...next }
  const queryString = buildBusSearchParams(nextParsed)
  const newSearch = queryString ? `?${queryString}` : ''
  const newUrl = `${window.location.pathname}${newSearch}${window.location.hash}`
  window.history.replaceState(window.history.state, '', newUrl)
  // There is no router in this app; a manual popstate dispatch nudges any
  // other mounted instance of this hook to re-read window.location.search,
  // mirroring useBoardingPointSelection's writeBoardingPointId.
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function useBusSearchFilters(isMobile: boolean): UseBusSearchFiltersResult {
  const [parsed, setParsed] = useState<ParsedBusSearchParams>(() => readParsed())
  const [draft, setDraft] = useState<BusSearchFilterState>(() => filtersFromParsed(parsed))

  useEffect(() => {
    const handlePopState = () => {
      setParsed(readParsed())
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const committed = useMemo(() => filtersFromParsed(parsed), [parsed])

  // Keep the draft in sync with whatever the URL currently says, whether
  // that's the initial mount, our own writeFilters-triggered popstate, or a
  // genuine Back/Forward navigation — any of those should discard a pending,
  // not-yet-applied mobile draft.
  useEffect(() => {
    setDraft(filtersFromParsed(parsed))
  }, [parsed])

  const applyFilterChange = useCallback(
    (updater: (prev: BusSearchFilterState) => BusSearchFilterState) => {
      if (isMobile) {
        setDraft((prev) => updater(prev))
      } else {
        const next = updater(filtersFromParsed(parsed))
        writeFilters(parsed, next)
      }
    },
    [isMobile, parsed],
  )

  const setType = useCallback(
    (t: Set<BusTypeToken>) => applyFilterChange((prev) => ({ ...prev, type: t })),
    [applyFilterChange],
  )

  const setTime = useCallback(
    (t: TimeBucket | null) => applyFilterChange((prev) => ({ ...prev, time: t })),
    [applyFilterChange],
  )

  const setFareRange = useCallback(
    (min: number, max: number) => applyFilterChange((prev) => ({ ...prev, fareMin: min, fareMax: max })),
    [applyFilterChange],
  )

  const setWomen = useCallback(
    (v: boolean) => applyFilterChange((prev) => ({ ...prev, women: v })),
    [applyFilterChange],
  )

  const setSort = useCallback(
    (s: SortKey) => applyFilterChange((prev) => ({ ...prev, sort: s })),
    [applyFilterChange],
  )

  const applyDraft = useCallback(() => {
    writeFilters(parsed, draft)
  }, [parsed, draft])

  const resetDraft = useCallback(() => {
    setDraft(filtersFromParsed(parsed))
  }, [parsed])

  const clearFilters = useCallback(() => {
    writeFilters(parsed, { ...DEFAULT_FILTERS })
    setDraft({ ...DEFAULT_FILTERS })
  }, [parsed])

  return {
    routeError: parsed.routeError,
    fromCityId: parsed.fromCityId,
    toCityId: parsed.toCityId,
    date: parsed.date,
    committed,
    draft,
    warnings: parsed.warnings,
    setType,
    setTime,
    setFareRange,
    setWomen,
    setSort,
    applyDraft,
    resetDraft,
    clearFilters,
  }
}

export default useBusSearchFilters
