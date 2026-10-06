import type { Bus } from '../types'
import type { BusTypeToken, SortKey, TimeBucket } from './busSearchParams'

/** Matches the '<fromCityId>-<toCityId>' convention used in src/data/buses.ts. */
export function routeIdFor(fromCityId: number, toCityId: number): string {
  return `${fromCityId}-${toCityId}`
}

export interface BusFilterCriteria {
  type: Set<BusTypeToken>
  time: TimeBucket | null
  fareMin: number | null
  fareMax: number | null
  women: boolean
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function matchesTimeBucket(departureTime: string, bucket: TimeBucket): boolean {
  const minutes = timeToMinutes(departureTime)
  switch (bucket) {
    case 'early':
      return minutes < 6 * 60
    case 'morning':
      return minutes >= 6 * 60 && minutes < 12 * 60
    case 'afternoon':
      return minutes >= 12 * 60 && minutes < 18 * 60
    case 'night':
      return minutes >= 18 * 60
    default:
      return true
  }
}

function matchesTypeTokens(busType: Bus['busType'], tokens: Set<BusTypeToken>): boolean {
  if (tokens.size === 0) return true
  // Split 'Non-AC Seater' into ['Non-AC', 'Seater'] so 'AC' never
  // substring-matches 'Non-AC'.
  const parts = busType.split(' ')
  for (const token of tokens) {
    if (!parts.includes(token)) return false
  }
  return true
}

export function filterBuses(buses: Bus[], filters: BusFilterCriteria): Bus[] {
  return buses.filter((bus) => {
    if (!matchesTypeTokens(bus.busType, filters.type)) return false
    if (filters.time !== null && !matchesTimeBucket(bus.departureTime, filters.time)) return false
    if (filters.fareMin !== null && bus.fare < filters.fareMin) return false
    if (filters.fareMax !== null && bus.fare > filters.fareMax) return false
    if (filters.women && !bus.isWomenFriendly) return false
    return true
  })
}

/** Returns a new, sorted array; ties are broken by ascending `id`. Does not mutate `buses`. */
export function sortBuses(buses: Bus[], sort: SortKey): Bus[] {
  const copy = [...buses]
  copy.sort((a, b) => {
    let diff = 0
    switch (sort) {
      case 'departure':
        diff = timeToMinutes(a.departureTime) - timeToMinutes(b.departureTime)
        break
      case 'fare':
        diff = a.fare - b.fare
        break
      case 'duration':
        diff = a.durationMins - b.durationMins
        break
      case 'rating':
        diff = b.rating - a.rating
        break
      default:
        diff = 0
    }
    if (diff !== 0) return diff
    return a.id - b.id
  })
  return copy
}

/** Min/max fare across the given route's full bus list, regardless of other active filters. */
export function fareBounds(buses: Bus[]): { min: number; max: number } {
  if (buses.length === 0) return { min: 0, max: 0 }
  let min = buses[0].fare
  let max = buses[0].fare
  for (const bus of buses) {
    if (bus.fare < min) min = bus.fare
    if (bus.fare > max) max = bus.fare
  }
  return { min, max }
}
