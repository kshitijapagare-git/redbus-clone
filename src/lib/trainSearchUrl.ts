/**
 * Builds the query string for the train search-results navigation.
 * `freeCancellation=1` is included only when `freeCancellation` is true; it
 * is never included (not even as `freeCancellation=0`) when false.
 */
export function buildTrainSearchUrl(
  fromStationId: number,
  toStationId: number,
  date: string,
  freeCancellation: boolean,
): string {
  const params = new URLSearchParams()
  params.set('from', String(fromStationId))
  params.set('to', String(toStationId))
  params.set('date', date)
  if (freeCancellation) {
    params.set('freeCancellation', '1')
  }
  return `/trains/search?${params.toString()}`
}
