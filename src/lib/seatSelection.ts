import type { BusSeatMap, Seat } from '../types'

export const SEATS_PARAM = 'seats'
export const MAX_SELECTABLE_SEATS = 6

/**
 * Parses the `seats` query param (a comma-separated list of seat ids) from a
 * query string such as `location.search`. Returns an empty array when the
 * param is missing or empty.
 */
export function parseSelectedSeatIds(search: string): string[] {
  const params = new URLSearchParams(search)
  const raw = params.get(SEATS_PARAM)
  if (raw === null || raw.trim() === '') return []
  return raw.split(',').filter((id) => id.length > 0)
}

/** Serializes a list of seat ids back into the comma-separated `seats` query value. */
export function buildSeatsQueryValue(ids: string[]): string {
  return ids.join(',')
}

function allSeats(seatMap: BusSeatMap): Seat[] {
  return [...seatMap.decks.lower, ...(seatMap.decks.upper ?? [])]
}

/**
 * Drops any seat id that is booked or does not exist on the given seat map,
 * preserving the original order of the remaining ids.
 */
export function sanitizeSeatSelection(ids: string[], seatMap: BusSeatMap): string[] {
  const bookedSet = new Set(seatMap.booked)
  const existingIds = new Set(allSeats(seatMap).map((s) => s.id))
  return ids.filter((id) => existingIds.has(id) && !bookedSet.has(id))
}

function parseSeatIdParts(id: string): { deckPrefix: string; number: number } {
  const match = id.match(/^([A-Za-z]*)(\d+)$/)
  if (!match) return { deckPrefix: id, number: 0 }
  return { deckPrefix: match[1], number: Number(match[2]) }
}

/**
 * Orders seat ids with lower-deck ids before upper-deck ids, and numerically
 * within a deck. Ids are expected to follow the 'L<n>'/'U<n>' convention used
 * in src/data/seats.ts; any id not matching that shape sorts by its deck
 * prefix (lower-case 'l' ranked ahead of anything else) and falls back to a
 * plain string compare.
 */
export function sortSeatIds(ids: string[]): string[] {
  const rankForPrefix = (prefix: string): number => {
    const upper = prefix.toUpperCase()
    if (upper === 'L') return 0
    if (upper === 'U') return 1
    return 2
  }

  return [...ids].sort((a, b) => {
    const partsA = parseSeatIdParts(a)
    const partsB = parseSeatIdParts(b)
    const rankA = rankForPrefix(partsA.deckPrefix)
    const rankB = rankForPrefix(partsB.deckPrefix)
    if (rankA !== rankB) return rankA - rankB
    if (partsA.number !== partsB.number) return partsA.number - partsB.number
    return a.localeCompare(b)
  })
}

export interface ToggleSeatSelectionResult {
  ids: string[]
  limitExceeded: boolean
}

/**
 * Toggles `seatId` in/out of `current`. Booked or nonexistent seats are
 * never added. Never returns more than MAX_SELECTABLE_SEATS ids: attempting
 * to add a seat beyond the cap leaves `current` unchanged and sets
 * `limitExceeded` to true.
 */
export function toggleSeatSelection(
  current: string[],
  seatId: string,
  seatMap: BusSeatMap,
): ToggleSeatSelectionResult {
  const bookedSet = new Set(seatMap.booked)
  const existingIds = new Set(allSeats(seatMap).map((s) => s.id))

  if (!existingIds.has(seatId) || bookedSet.has(seatId)) {
    return { ids: current, limitExceeded: false }
  }

  if (current.includes(seatId)) {
    return { ids: current.filter((id) => id !== seatId), limitExceeded: false }
  }

  if (current.length >= MAX_SELECTABLE_SEATS) {
    return { ids: current, limitExceeded: true }
  }

  return { ids: [...current, seatId], limitExceeded: false }
}
