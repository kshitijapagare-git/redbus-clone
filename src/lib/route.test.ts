import { describe, expect, it } from 'vitest'
import { buildSeatSelectionUrl, matchSeatSelectionPath } from './route'

describe('matchSeatSelectionPath', () => {
  it('returns the numeric busId for a valid seat-selection path', () => {
    expect(matchSeatSelectionPath('/search/3/seats')).toBe(3)
  })

  it('returns null for a non-numeric busId', () => {
    expect(matchSeatSelectionPath('/search/abc/seats')).toBeNull()
  })

  it('returns null for a path missing the /seats suffix', () => {
    expect(matchSeatSelectionPath('/search/3')).toBeNull()
  })

  it('returns null for an unrelated path', () => {
    expect(matchSeatSelectionPath('/hotels')).toBeNull()
  })

  it('returns null for a path with trailing segments', () => {
    expect(matchSeatSelectionPath('/search/3/seats/passengers')).toBeNull()
  })
})

describe('buildSeatSelectionUrl', () => {
  it('builds a bare seats URL when no params are given', () => {
    expect(buildSeatSelectionUrl(3, {})).toBe('/search/3/seats')
  })

  it('includes seats, bp and dp when provided', () => {
    expect(buildSeatSelectionUrl(3, { seats: ['L1', 'L2'], bp: 2, dp: 7 })).toBe(
      '/search/3/seats?seats=L1%2CL2&bp=2&dp=7',
    )
  })

  it('omits seats when the list is empty', () => {
    expect(buildSeatSelectionUrl(3, { seats: [], bp: 2 })).toBe('/search/3/seats?bp=2')
  })
})
