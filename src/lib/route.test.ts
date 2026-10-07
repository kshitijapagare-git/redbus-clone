import { describe, expect, it } from 'vitest'
import {
  buildBookingUrl,
  buildPassengerDetailsUrl,
  buildPaymentUrl,
  buildSeatSelectionUrl,
  matchBookingPath,
  matchPaymentPath,
  matchSeatSelectionPath,
} from './route'

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

  it('includes date when provided', () => {
    expect(buildSeatSelectionUrl(3, { date: '2024-10-07' })).toBe('/search/3/seats?date=2024-10-07')
  })

  it('omits date when not provided', () => {
    expect(buildSeatSelectionUrl(3, {})).toBe('/search/3/seats')
  })
})

describe('buildPassengerDetailsUrl', () => {
  it('includes date when provided', () => {
    expect(buildPassengerDetailsUrl(3, { seats: ['L1'], bp: 1, dp: 3, date: '2024-10-07' })).toBe(
      '/search/3/seats/passengers?seats=L1&bp=1&dp=3&date=2024-10-07',
    )
  })

  it('omits date when not provided', () => {
    expect(buildPassengerDetailsUrl(3, { seats: ['L1'], bp: 1, dp: 3 })).toBe(
      '/search/3/seats/passengers?seats=L1&bp=1&dp=3',
    )
  })
})

describe('matchPaymentPath', () => {
  it('returns the numeric busId for a valid payment path', () => {
    expect(matchPaymentPath('/search/3/seats/payment')).toBe(3)
  })

  it('returns null for an unrelated path', () => {
    expect(matchPaymentPath('/search/3/seats')).toBeNull()
  })
})

describe('buildPaymentUrl', () => {
  it('builds the payment URL carrying seats/bp/dp/date', () => {
    expect(buildPaymentUrl(3, { seats: ['L1', 'L2'], bp: 1, dp: 3, date: '2024-10-07' })).toBe(
      '/search/3/seats/payment?seats=L1%2CL2&bp=1&dp=3&date=2024-10-07',
    )
  })
})

describe('matchBookingPath', () => {
  it('returns the pnr for a valid booking path', () => {
    expect(matchBookingPath('/booking/ABCD123456')).toBe('ABCD123456')
  })

  it('returns null for an unrelated path', () => {
    expect(matchBookingPath('/search/3/seats')).toBeNull()
  })
})

describe('buildBookingUrl', () => {
  it('builds the booking URL for a pnr', () => {
    expect(buildBookingUrl('ABCD123456')).toBe('/booking/ABCD123456')
  })
})
