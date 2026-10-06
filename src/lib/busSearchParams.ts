import type { City } from '../types'

export type BusTypeToken = 'AC' | 'Non-AC' | 'Seater' | 'Sleeper'
export type TimeBucket = 'early' | 'morning' | 'afternoon' | 'night'
export type SortKey = 'departure' | 'fare' | 'duration' | 'rating'

const VALID_TYPE_TOKENS: BusTypeToken[] = ['AC', 'Non-AC', 'Seater', 'Sleeper']
const VALID_TIME_BUCKETS: TimeBucket[] = ['early', 'morning', 'afternoon', 'night']
const VALID_SORT_KEYS: SortKey[] = ['departure', 'fare', 'duration', 'rating']
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export interface ParsedBusSearchParams {
  routeError: string | null
  fromCityId: number | null
  toCityId: number | null
  date: string | null
  women: boolean
  type: Set<BusTypeToken>
  time: TimeBucket | null
  fareMin: number | null
  fareMax: number | null
  sort: SortKey
  warnings: string[]
}

function isValidDate(date: string | null): date is string {
  if (date === null) return false
  if (!DATE_PATTERN.test(date)) return false
  const [year, month, day] = date.split('-').map(Number)
  const parsed = new Date(year, month - 1, day)
  return (
    parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day
  )
}

/**
 * Parses and validates a `/search` query string.
 *
 * `routeError` is set (and nothing else matters) when the from/to city ids
 * cannot be resolved against `cities`, or when the date is missing/invalid —
 * these stop the page from rendering results at all. Everything else
 * (type/time/sort/women/fare tokens) is validated independently: unknown or
 * malformed individual values are dropped and reported in `warnings`, while
 * the remaining valid filters still apply.
 */
export function parseBusSearchParams(search: string, cities: City[]): ParsedBusSearchParams {
  const params = new URLSearchParams(search)
  const warnings: string[] = []

  const fromRaw = params.get('from')
  const toRaw = params.get('to')
  const dateRaw = params.get('date')

  const fromCityId = fromRaw !== null && /^\d+$/.test(fromRaw) ? Number(fromRaw) : null
  const toCityId = toRaw !== null && /^\d+$/.test(toRaw) ? Number(toRaw) : null

  const cityIds = new Set(cities.map((c) => c.id))
  const fromResolved = fromCityId !== null && cityIds.has(fromCityId) ? fromCityId : null
  const toResolved = toCityId !== null && cityIds.has(toCityId) ? toCityId : null

  let routeError: string | null = null
  if (fromResolved === null || toResolved === null) {
    routeError = 'Unknown departure or destination city.'
  } else if (!isValidDate(dateRaw)) {
    routeError = 'Missing or invalid date of journey.'
  }

  const date = isValidDate(dateRaw) ? dateRaw : null

  // women
  const womenRaw = params.get('women')
  let women = false
  if (womenRaw !== null) {
    if (womenRaw === '1') {
      women = true
    } else if (womenRaw === '0') {
      women = false
    } else {
      warnings.push(`Ignored invalid women filter value: "${womenRaw}"`)
    }
  }

  // type
  const typeRaw = params.get('type')
  const type = new Set<BusTypeToken>()
  if (typeRaw !== null && typeRaw.length > 0) {
    const tokens = typeRaw.split(',')
    for (const token of tokens) {
      if ((VALID_TYPE_TOKENS as string[]).includes(token)) {
        type.add(token as BusTypeToken)
      } else {
        warnings.push(`Ignored unknown bus type filter: "${token}"`)
      }
    }
  }

  // time
  const timeRaw = params.get('time')
  let time: TimeBucket | null = null
  if (timeRaw !== null) {
    if ((VALID_TIME_BUCKETS as string[]).includes(timeRaw)) {
      time = timeRaw as TimeBucket
    } else {
      warnings.push(`Ignored invalid departure time filter: "${timeRaw}"`)
    }
  }

  // fare range
  const fareMinRaw = params.get('fareMin')
  const fareMaxRaw = params.get('fareMax')
  let fareMin: number | null = null
  let fareMax: number | null = null
  if (fareMinRaw !== null) {
    const parsed = Number(fareMinRaw)
    if (!Number.isNaN(parsed) && fareMinRaw.trim() !== '') {
      fareMin = parsed
    } else {
      warnings.push(`Ignored invalid minimum fare value: "${fareMinRaw}"`)
    }
  }
  if (fareMaxRaw !== null) {
    const parsed = Number(fareMaxRaw)
    if (!Number.isNaN(parsed) && fareMaxRaw.trim() !== '') {
      fareMax = parsed
    } else {
      warnings.push(`Ignored invalid maximum fare value: "${fareMaxRaw}"`)
    }
  }

  // sort
  const sortRaw = params.get('sort')
  let sort: SortKey = 'departure'
  if (sortRaw !== null) {
    if ((VALID_SORT_KEYS as string[]).includes(sortRaw)) {
      sort = sortRaw as SortKey
    } else {
      warnings.push(`Ignored invalid sort value: "${sortRaw}"`)
    }
  }

  return {
    routeError,
    fromCityId: fromResolved,
    toCityId: toResolved,
    date,
    women,
    type,
    time,
    fareMin,
    fareMax,
    sort,
    warnings,
  }
}

/**
 * Serializes only recognized, currently-set filter values back into a query
 * string. Used by the hook to write committed filter state to the URL.
 */
export function buildBusSearchParams(current: ParsedBusSearchParams): string {
  const params = new URLSearchParams()

  if (current.fromCityId !== null) params.set('from', String(current.fromCityId))
  if (current.toCityId !== null) params.set('to', String(current.toCityId))
  if (current.date !== null) params.set('date', current.date)
  if (current.women) params.set('women', '1')
  if (current.type.size > 0) params.set('type', Array.from(current.type).join(','))
  if (current.time !== null) params.set('time', current.time)
  if (current.fareMin !== null) params.set('fareMin', String(current.fareMin))
  if (current.fareMax !== null) params.set('fareMax', String(current.fareMax))
  if (current.sort !== 'departure') params.set('sort', current.sort)

  return params.toString()
}
