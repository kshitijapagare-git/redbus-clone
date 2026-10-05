export const WOMEN_TOGGLE_STORAGE_KEY = 'redbus:womenToggle'

/**
 * Loads the persisted women-toggle value from localStorage. Never throws.
 *
 * Any structural corruption (unreadable storage, invalid JSON, or a value
 * that isn't a boolean) is treated as fully broken: `available` is false and
 * `value` defaults to false, matching the pattern used by recentSearches.ts.
 */
export function loadWomenToggle(): { value: boolean; available: boolean } {
  let raw: string | null
  try {
    raw = localStorage.getItem(WOMEN_TOGGLE_STORAGE_KEY)
  } catch {
    return { value: false, available: false }
  }

  if (raw === null) {
    return { value: false, available: true }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { value: false, available: false }
  }

  if (typeof parsed !== 'boolean') {
    return { value: false, available: false }
  }

  return { value: parsed, available: true }
}

/** Persists the given value to localStorage. Never throws; returns false on failure. */
export function persistWomenToggle(value: boolean): boolean {
  try {
    localStorage.setItem(WOMEN_TOGGLE_STORAGE_KEY, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}
