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

const SEAT_SELECTION_PATH_PATTERN = /^\/search\/(\d+)\/seats$/

/** Matches exactly '/search/:busId/seats' with a numeric busId; returns null otherwise. */
export function matchSeatSelectionPath(pathname: string): number | null {
  const match = SEAT_SELECTION_PATH_PATTERN.exec(pathname)
  if (!match) return null
  const busId = Number(match[1])
  return Number.isFinite(busId) ? busId : null
}

export interface BuildSeatSelectionUrlParams {
  seats?: string[]
  bp?: number
  dp?: number
}

/** Builds the `/search/:busId/seats` URL, optionally carrying seats/bp/dp query params. */
export function buildSeatSelectionUrl(busId: number, params: BuildSeatSelectionUrlParams): string {
  const searchParams = new URLSearchParams()
  if (params.seats && params.seats.length > 0) {
    searchParams.set('seats', params.seats.join(','))
  }
  if (params.bp !== undefined) {
    searchParams.set('bp', String(params.bp))
  }
  if (params.dp !== undefined) {
    searchParams.set('dp', String(params.dp))
  }
  const query = searchParams.toString()
  return `/search/${busId}/seats${query ? `?${query}` : ''}`
}

const PASSENGER_DETAILS_PATH_PATTERN = /^\/search\/(\d+)\/seats\/passengers$/

/** Matches exactly '/search/:busId/seats/passengers' with a numeric busId; returns null otherwise. */
export function matchPassengerDetailsPath(pathname: string): number | null {
  const match = PASSENGER_DETAILS_PATH_PATTERN.exec(pathname)
  if (!match) return null
  const busId = Number(match[1])
  return Number.isFinite(busId) ? busId : null
}

export interface BuildPassengerDetailsUrlParams {
  seats: string[]
  bp: number
  dp: number
}

/** Builds the `/search/:busId/seats/passengers` URL, carrying the chosen seats/bp/dp. */
export function buildPassengerDetailsUrl(busId: number, params: BuildPassengerDetailsUrlParams): string {
  const searchParams = new URLSearchParams()
  searchParams.set('seats', params.seats.join(','))
  searchParams.set('bp', String(params.bp))
  searchParams.set('dp', String(params.dp))
  return `/search/${busId}/seats/passengers?${searchParams.toString()}`
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
