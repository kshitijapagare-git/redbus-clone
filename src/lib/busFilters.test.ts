import { describe, expect, it } from 'vitest'
import { fareBounds, filterBuses, routeIdFor, sortBuses } from './busFilters'
import type { Bus } from '../types'

const emptyFilters = { type: new Set<any>(), time: null, fareMin: null, fareMax: null, women: false }

const sampleBuses: Bus[] = [
  {
    id: 1,
    routeId: '1-2',
    operatorName: 'A',
    busType: 'AC Seater',
    departureTime: '05:00',
    arrivalTime: '10:00',
    durationMins: 300,
    fare: 500,
    seatsAvailable: 10,
    rating: 4.0,
    isWomenFriendly: true,
  },
  {
    id: 2,
    routeId: '1-2',
    operatorName: 'B',
    busType: 'Non-AC Seater',
    departureTime: '07:00',
    arrivalTime: '13:00',
    durationMins: 360,
    fare: 400,
    seatsAvailable: 5,
    rating: 3.5,
    isWomenFriendly: false,
  },
  {
    id: 3,
    routeId: '1-2',
    operatorName: 'C',
    busType: 'AC Sleeper',
    departureTime: '13:00',
    arrivalTime: '20:00',
    durationMins: 420,
    fare: 900,
    seatsAvailable: 3,
    rating: 4.5,
    isWomenFriendly: true,
  },
  {
    id: 4,
    routeId: '1-2',
    operatorName: 'D',
    busType: 'Non-AC Sleeper',
    departureTime: '19:00',
    arrivalTime: '03:00',
    durationMins: 480,
    fare: 700,
    seatsAvailable: 8,
    rating: 4.0,
    isWomenFriendly: false,
  },
  {
    id: 5,
    routeId: '1-2',
    operatorName: 'E',
    busType: 'AC Seater',
    departureTime: '05:00',
    arrivalTime: '09:00',
    durationMins: 240,
    fare: 500,
    seatsAvailable: 12,
    rating: 4.0,
    isWomenFriendly: false,
  },
]

describe('routeIdFor', () => {
  it('builds the from-to routeId convention', () => {
    expect(routeIdFor(1, 2)).toBe('1-2')
    expect(routeIdFor(2, 1)).toBe('2-1')
  })
})

describe('filterBuses', () => {
  it('matches a bus only when it satisfies ALL selected type tokens', () => {
    const result = filterBuses(sampleBuses, { ...emptyFilters, type: new Set(['AC', 'Seater']) })
    expect(result.map((b) => b.id)).toEqual([1, 5])
  })

  it('excludes a Non-AC Seater bus when only AC is selected (no substring false-match)', () => {
    const result = filterBuses(sampleBuses, { ...emptyFilters, type: new Set(['AC']) })
    expect(result.map((b) => b.id)).not.toContain(2)
    expect(result.map((b) => b.id)).toEqual([1, 3, 5])
  })

  it('filters by the early time bucket (<06:00)', () => {
    const result = filterBuses(sampleBuses, { ...emptyFilters, time: 'early' })
    expect(result.map((b) => b.id)).toEqual([1, 5])
  })

  it('filters by the morning time bucket (06:00-11:59)', () => {
    const result = filterBuses(sampleBuses, { ...emptyFilters, time: 'morning' })
    expect(result.map((b) => b.id)).toEqual([2])
  })

  it('filters by the afternoon time bucket (12:00-17:59)', () => {
    const result = filterBuses(sampleBuses, { ...emptyFilters, time: 'afternoon' })
    expect(result.map((b) => b.id)).toEqual([3])
  })

  it('filters by the night time bucket (>=18:00)', () => {
    const result = filterBuses(sampleBuses, { ...emptyFilters, time: 'night' })
    expect(result.map((b) => b.id)).toEqual([4])
  })

  it('returns only women-friendly buses when the women filter is on', () => {
    const result = filterBuses(sampleBuses, { ...emptyFilters, women: true })
    expect(result.map((b) => b.id)).toEqual([1, 3])
  })

  it('applies an inclusive fare range', () => {
    const result = filterBuses(sampleBuses, { ...emptyFilters, fareMin: 500, fareMax: 700 })
    expect(result.map((b) => b.id)).toEqual([1, 4, 5])
  })

  it('combines multiple filters together (AND semantics across all)', () => {
    const result = filterBuses(sampleBuses, {
      type: new Set(['AC', 'Seater']),
      time: 'early',
      fareMin: 400,
      fareMax: 600,
      women: true,
    })
    expect(result.map((b) => b.id)).toEqual([1])
  })
})

describe('sortBuses', () => {
  it('sorts ascending by departure, ties broken by ascending id', () => {
    const result = sortBuses(sampleBuses, 'departure')
    expect(result.map((b) => b.id)).toEqual([1, 5, 2, 3, 4])
  })

  it('sorts ascending by fare, ties broken by ascending id', () => {
    const result = sortBuses(sampleBuses, 'fare')
    expect(result.map((b) => b.id)).toEqual([2, 1, 5, 4, 3])
  })

  it('sorts ascending by duration', () => {
    const result = sortBuses(sampleBuses, 'duration')
    expect(result.map((b) => b.id)).toEqual([5, 1, 2, 3, 4])
  })

  it('sorts descending by rating, ties broken by ascending id', () => {
    const result = sortBuses(sampleBuses, 'rating')
    expect(result.map((b) => b.id)).toEqual([3, 1, 4, 5, 2])
  })

  it('does not mutate the input array', () => {
    const original = [...sampleBuses]
    sortBuses(sampleBuses, 'fare')
    expect(sampleBuses).toEqual(original)
  })
})

describe('fareBounds', () => {
  it('returns the min and max fare across all given buses', () => {
    expect(fareBounds(sampleBuses)).toEqual({ min: 400, max: 900 })
  })

  it('is unaffected by filters since it operates on the given full list', () => {
    const filtered = filterBuses(sampleBuses, { ...emptyFilters, type: new Set(['AC']) })
    // fareBounds should still be computed against whatever list it's given;
    // here we show it reflects the full route list when given the full list,
    // not the filtered subset.
    expect(fareBounds(sampleBuses)).toEqual({ min: 400, max: 900 })
    expect(fareBounds(filtered)).not.toEqual(fareBounds(sampleBuses))
  })
})
