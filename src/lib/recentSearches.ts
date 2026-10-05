import type { City, RecentSearch } from '../types'

export const RECENT_SEARCHES_STORAGE_KEY = 'redbus:recentSearches'
export const MAX_RECENT_SEARCHES = 5

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const pad = (n: number) => String(n).padStart(2, '0')

/** Formats a Date as a 'YYYY-MM-DD' key using local calendar date parts. */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * Calendar-date comparison (local timezone, start-of-day). Because both keys
 * are zero-padded 'YYYY-MM-DD' strings, lexicographic comparison is
 * equivalent to chronological comparison.
 */
export function isPastDate(dateKey: string, today: Date): boolean {
  return dateKey < toDateKey(today)
}

function isValidShape(value: unknown): value is RecentSearch {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.fromCityId === 'number' &&
    typeof candidate.toCityId === 'number' &&
    typeof candidate.date === 'string' &&
    DATE_KEY_PATTERN.test(candidate.date)
  )
}

function safeParseJsonArray(raw: string | null): unknown[] | null {
  if (raw === null) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!Array.isArray(parsed)) return null
  return parsed
}

/**
 * Best-effort parse of raw stored JSON into valid entries. Never throws.
 * Drops individual malformed entries rather than failing the whole parse.
 */
export function parseStoredSearches(raw: string | null): RecentSearch[] {
  const parsed = safeParseJsonArray(raw)
  if (parsed === null) return []
  return parsed.filter(isValidShape)
}

/**
 * Loads recent searches from localStorage. Never throws.
 *
 * Any structural corruption (unreadable storage, invalid JSON, non-array
 * data, or entries missing required fields) is treated as fully broken:
 * `available` is false and `searches` is empty. A valid entry referencing a
 * city that no longer exists is dropped quietly instead, since that's an
 * expected, recoverable situation rather than corruption.
 */
export function loadRecentSearches(cities: City[]): { searches: RecentSearch[]; available: boolean } {
  let raw: string | null
  try {
    raw = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY)
  } catch {
    return { searches: [], available: false }
  }

  const parsed = safeParseJsonArray(raw)
  if (parsed === null) {
    return { searches: [], available: false }
  }

  if (!parsed.every(isValidShape)) {
    return { searches: [], available: false }
  }

  const validEntries = parsed as RecentSearch[]
  const cityIds = new Set(cities.map((c) => c.id))
  const filtered = validEntries.filter((e) => cityIds.has(e.fromCityId) && cityIds.has(e.toCityId))

  return { searches: filtered.slice(0, MAX_RECENT_SEARCHES), available: true }
}

/** Persists the given list to localStorage. Never throws; returns false on failure. */
export function persistRecentSearches(searches: RecentSearch[]): boolean {
  try {
    localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(searches))
    return true
  } catch {
    return false
  }
}

/**
 * Adds/moves `entry` to the front of `searches`, deduping on the
 * fromCityId+toCityId route (the newest date wins), and caps the result at
 * MAX_RECENT_SEARCHES.
 */
export function upsertRecentSearch(searches: RecentSearch[], entry: RecentSearch): RecentSearch[] {
  const withoutMatch = searches.filter(
    (s) => !(s.fromCityId === entry.fromCityId && s.toCityId === entry.toCityId),
  )
  return [entry, ...withoutMatch].slice(0, MAX_RECENT_SEARCHES)
}

/** Returns a new list with the entry at `index` removed. */
export function removeRecentSearchAt(searches: RecentSearch[], index: number): RecentSearch[] {
  return searches.filter((_, i) => i !== index)
}

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/** Formats a 'YYYY-MM-DD' key for display, e.g. '02 Oct'. */
export function formatRecentSearchDate(dateKey: string): string {
  const [, month, day] = dateKey.split('-').map((part) => Number(part))
  return `${pad(day)} ${MONTH_LABELS[month - 1]}`
}
