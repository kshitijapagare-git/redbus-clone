import { describe, expect, it } from 'vitest'
import { buildBusSearchParams, parseBusSearchParams } from './busSearchParams'
import { cities } from '../data'

describe('parseBusSearchParams', () => {
  it('parses a full valid query string with no warnings and no routeError', () => {
    const search =
      '?from=1&to=2&date=2024-10-07&women=1&type=AC,Sleeper&time=night&sort=fare&fareMin=500&fareMax=1200'
    const result = parseBusSearchParams(search, cities)

    expect(result.routeError).toBeNull()
    expect(result.warnings).toEqual([])
    expect(result.fromCityId).toBe(1)
    expect(result.toCityId).toBe(2)
    expect(result.date).toBe('2024-10-07')
    expect(result.women).toBe(true)
    expect(result.type).toEqual(new Set(['AC', 'Sleeper']))
    expect(result.time).toBe('night')
    expect(result.sort).toBe('fare')
    expect(result.fareMin).toBe(500)
    expect(result.fareMax).toBe(1200)
  })

  it('produces a routeError and no warnings for an unresolved from city id', () => {
    const result = parseBusSearchParams('?from=999&to=2&date=2024-10-07', cities)
    expect(result.routeError).not.toBeNull()
    expect(result.warnings).toEqual([])
  })

  it('produces a routeError and no warnings for an unresolved to city id', () => {
    const result = parseBusSearchParams('?from=1&to=999&date=2024-10-07', cities)
    expect(result.routeError).not.toBeNull()
    expect(result.warnings).toEqual([])
  })

  it('produces a routeError for a missing date', () => {
    const result = parseBusSearchParams('?from=1&to=2', cities)
    expect(result.routeError).not.toBeNull()
  })

  it('produces a routeError for a malformed date', () => {
    const result = parseBusSearchParams('?from=1&to=2&date=not-a-date', cities)
    expect(result.routeError).not.toBeNull()
  })

  it('drops an unrecognized type token but keeps the rest and warns', () => {
    const result = parseBusSearchParams('?from=1&to=2&date=2024-10-07&type=AC,Bogus', cities)
    expect(result.routeError).toBeNull()
    expect(result.type).toEqual(new Set(['AC']))
    expect(result.warnings.length).toBeGreaterThan(0)
  })

  it('drops an invalid time value and warns', () => {
    const result = parseBusSearchParams('?from=1&to=2&date=2024-10-07&time=midnight', cities)
    expect(result.routeError).toBeNull()
    expect(result.time).toBeNull()
    expect(result.warnings.length).toBeGreaterThan(0)
  })

  it('drops an invalid sort value, defaults to departure, and warns', () => {
    const result = parseBusSearchParams('?from=1&to=2&date=2024-10-07&sort=popularity', cities)
    expect(result.routeError).toBeNull()
    expect(result.sort).toBe('departure')
    expect(result.warnings.length).toBeGreaterThan(0)
  })

  it('defaults sort to departure when absent, with no warning', () => {
    const result = parseBusSearchParams('?from=1&to=2&date=2024-10-07', cities)
    expect(result.sort).toBe('departure')
    expect(result.warnings).toEqual([])
  })

  it('drops a non-numeric women value and warns', () => {
    const result = parseBusSearchParams('?from=1&to=2&date=2024-10-07&women=yes', cities)
    expect(result.routeError).toBeNull()
    expect(result.women).toBe(false)
    expect(result.warnings.length).toBeGreaterThan(0)
  })

  it('defaults women to true only when women=1 is present', () => {
    const withWomen = parseBusSearchParams('?from=1&to=2&date=2024-10-07&women=1', cities)
    expect(withWomen.women).toBe(true)
  })

  it('defaults women to false when absent', () => {
    const result = parseBusSearchParams('?from=1&to=2&date=2024-10-07', cities)
    expect(result.women).toBe(false)
  })

  it('defaults women to false for any other value', () => {
    const result = parseBusSearchParams('?from=1&to=2&date=2024-10-07&women=0', cities)
    expect(result.women).toBe(false)
  })

  it('round-trips a parsed result through build and parse again', () => {
    const search =
      '?from=1&to=2&date=2024-10-07&women=1&type=AC,Sleeper&time=night&sort=fare&fareMin=500&fareMax=1200'
    const first = parseBusSearchParams(search, cities)
    const rebuilt = buildBusSearchParams(first)
    const second = parseBusSearchParams(`?${rebuilt}`, cities)

    expect(second.fromCityId).toBe(first.fromCityId)
    expect(second.toCityId).toBe(first.toCityId)
    expect(second.date).toBe(first.date)
    expect(second.women).toBe(first.women)
    expect(second.type).toEqual(first.type)
    expect(second.time).toBe(first.time)
    expect(second.sort).toBe(first.sort)
    expect(second.fareMin).toBe(first.fareMin)
    expect(second.fareMax).toBe(first.fareMax)
  })
})
