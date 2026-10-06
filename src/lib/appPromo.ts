export const APP_PROMO_DISMISSED_STORAGE_KEY = 'redbus:appPromoDismissed'

const DISMISSED_VALUE = '1'

/**
 * Loads the persisted app-promo-dismissed flag from localStorage. Never throws.
 *
 * Unlike recentSearches.ts/womenToggle.ts this isn't JSON-encoded — the raw
 * stored string is compared directly against the sentinel '1' value, so any
 * other stored value (or no value at all) is simply treated as "not
 * dismissed" rather than as corruption.
 */
export function loadAppPromoDismissed(): { dismissed: boolean; available: boolean } {
  let raw: string | null
  try {
    raw = localStorage.getItem(APP_PROMO_DISMISSED_STORAGE_KEY)
  } catch {
    return { dismissed: false, available: false }
  }

  return { dismissed: raw === DISMISSED_VALUE, available: true }
}

/** Persists the dismissed flag to localStorage. Never throws; returns false on failure. */
export function persistAppPromoDismissed(): boolean {
  try {
    localStorage.setItem(APP_PROMO_DISMISSED_STORAGE_KEY, DISMISSED_VALUE)
    return true
  } catch {
    return false
  }
}
