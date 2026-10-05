import type { BoardingPoint, City } from '../types'

export const BOARDING_POINT_PARAM = 'bp'

/**
 * Reads the boarding point id from a query string (e.g. `location.search`).
 * Returns null when the param is missing or not a whole number.
 */
export function parseBoardingPointId(search: string): number | null {
  const params = new URLSearchParams(search)
  const raw = params.get(BOARDING_POINT_PARAM)
  if (raw === null) return null
  if (!/^-?\d+$/.test(raw)) return null
  const id = Number(raw)
  return Number.isFinite(id) ? id : null
}

/**
 * Returns a new query string with the `bp` key set to `id`, or removed
 * entirely when `id` is null. Any other existing query params are preserved
 * untouched. The result includes a leading `?` when non-empty, matching the
 * shape of `location.search`, or `''` when there are no params left.
 */
export function withBoardingPointId(search: string, id: number | null): string {
  const params = new URLSearchParams(search)
  if (id === null) {
    params.delete(BOARDING_POINT_PARAM)
  } else {
    params.set(BOARDING_POINT_PARAM, String(id))
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}

/**
 * Validates a candidate boarding point id against the known boarding points
 * and the currently selected From city. Returns the matching BoardingPoint
 * only when the id exists AND that point's cityId equals fromCityId;
 * otherwise returns null (covers both "doesn't exist" and "wrong city").
 */
export function resolveSelectedBoardingPoint(
  id: number | null,
  boardingPoints: BoardingPoint[],
  fromCityId: City['id'] | null,
): BoardingPoint | null {
  if (id === null) return null
  const point = boardingPoints.find((bp) => bp.id === id)
  if (!point) return null
  if (point.cityId !== fromCityId) return null
  return point
}
