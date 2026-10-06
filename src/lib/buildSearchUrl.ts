import type { City } from '../types'

export interface BuildBusSearchUrlParams {
  fromCityId: City['id']
  toCityId: City['id']
  date: string
  women: boolean
}

/**
 * Builds the `/search` results-page URL from the selected route/date/women
 * state. `women=1` is included only when `women` is true; it is never
 * included (not even as `women=0`) when false, matching the query shape
 * `parseBusSearchParams` expects.
 */
export function buildBusSearchUrl({ fromCityId, toCityId, date, women }: BuildBusSearchUrlParams): string {
  const params = new URLSearchParams()
  params.set('from', String(fromCityId))
  params.set('to', String(toCityId))
  params.set('date', date)
  if (women) {
    params.set('women', '1')
  }
  return `/search?${params.toString()}`
}
