import { describe, expect, it } from 'vitest'
import {
  BOARDING_POINT_PARAM,
  parseBoardingPointId,
  resolveSelectedBoardingPoint,
  withBoardingPointId,
} from './boardingPointSelection'
import type { BoardingPoint } from '../types'

const boardingPoints: BoardingPoint[] = [
  { id: 1, name: 'Shivajinagar', address: 'FC Road', landmark: 'Near Modern Cafe', cityId: 1 },
  { id: 2, name: 'Hinjewadi', address: 'Phase 1', landmark: 'Near Wipro Circle', cityId: 1 },
  { id: 3, name: 'Majestic', address: 'Kempegowda Bus Station', landmark: 'Opp. Railway Station', cityId: 2 },
]

describe('BOARDING_POINT_PARAM', () => {
  it('is "bp"', () => {
    expect(BOARDING_POINT_PARAM).toBe('bp')
  })
})

describe('parseBoardingPointId', () => {
  it('returns the numeric id when present', () => {
    expect(parseBoardingPointId('?bp=2')).toBe(2)
  })

  it('returns null when the query string is empty', () => {
    expect(parseBoardingPointId('')).toBeNull()
  })

  it('returns null when bp is not numeric', () => {
    expect(parseBoardingPointId('?bp=abc')).toBeNull()
  })

  it('returns null when bp is missing but other params exist', () => {
    expect(parseBoardingPointId('?foo=bar')).toBeNull()
  })
})

describe('withBoardingPointId', () => {
  it('adds bp=<id> to a search string that lacks it', () => {
    expect(withBoardingPointId('', 2)).toBe('?bp=2')
  })

  it('removes the bp key entirely when called with null', () => {
    expect(withBoardingPointId('?bp=2', null)).toBe('')
  })

  it('preserves other existing query params when setting bp', () => {
    const result = withBoardingPointId('?foo=bar', 2)
    const params = new URLSearchParams(result)
    expect(params.get('foo')).toBe('bar')
    expect(params.get('bp')).toBe('2')
  })

  it('preserves other existing query params when clearing bp', () => {
    const result = withBoardingPointId('?foo=bar&bp=2', null)
    const params = new URLSearchParams(result)
    expect(params.get('foo')).toBe('bar')
    expect(params.has('bp')).toBe(false)
  })
})

describe('resolveSelectedBoardingPoint', () => {
  it('returns null when id does not match any boarding point', () => {
    expect(resolveSelectedBoardingPoint(999, boardingPoints, 1)).toBeNull()
  })

  it('returns null when id matches a boarding point in a different city', () => {
    expect(resolveSelectedBoardingPoint(3, boardingPoints, 1)).toBeNull()
  })

  it('returns the matching boarding point when id exists and cityId matches', () => {
    expect(resolveSelectedBoardingPoint(2, boardingPoints, 1)).toEqual(boardingPoints[1])
  })

  it('returns null when id is null', () => {
    expect(resolveSelectedBoardingPoint(null, boardingPoints, 1)).toBeNull()
  })
})
