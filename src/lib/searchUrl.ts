/**
 * Builds the query string for the search-results navigation. `women=1` is
 * included only when `forWomen` is true; it is never included (not even as
 * `women=0`) when false.
 */
export function buildSearchUrl(fromCityId: number, toCityId: number, date: string, forWomen: boolean): string {
  const params = new URLSearchParams()
  params.set('from', String(fromCityId))
  params.set('to', String(toCityId))
  params.set('date', date)
  if (forWomen) {
    params.set('women', '1')
  }
  return `/search?${params.toString()}`
}
