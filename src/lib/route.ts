import { useEffect, useState } from 'react'

export const HOME_PATH = '/'
export const HOTELS_PATH = '/hotels'
export const TRAINS_PATH = '/trains'
export const TRAINS_SEARCH_PATH = '/trains/search'
export const ACCOUNT_PATH = '/account'
export const HELP_PATH = '/help'
export const OFFERS_PATH = '/offers'
export const SEARCH_PATH = '/search'

/**
 * Navigates to `path` using the History API and notifies any mounted
 * `useCurrentPath` instances via a manual popstate dispatch — mirroring the
 * no-router convention already used by useBoardingPointSelection.ts.
 */
export function navigateTo(path: string): void {
  window.history.pushState(window.history.state, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

/** Reads window.location.pathname and re-renders whenever it changes. */
export function useCurrentPath(): string {
  const [path, setPath] = useState(() => window.location.pathname)

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return path
}
