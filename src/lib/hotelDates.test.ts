import { describe, expect, it } from 'vitest'
import { addDays, correctCheckOut, formatHotelDate } from './hotelDates'

describe('addDays', () => {
  it('returns a date exactly one calendar day after the given date', () => {
    const date = new Date(2024, 9, 5) // 5 Oct 2024
    const result = addDays(date, 1)
    expect(result.getFullYear()).toBe(2024)
    expect(result.getMonth()).toBe(9)
    expect(result.getDate()).toBe(6)
  })

  it('does not mutate the input date', () => {
    const date = new Date(2024, 9, 5)
    addDays(date, 1)
    expect(date.getDate()).toBe(5)
  })

  it('crosses a month boundary correctly', () => {
    const date = new Date(2024, 9, 31) // 31 Oct 2024
    const result = addDays(date, 1)
    expect(result.getMonth()).toBe(10) // Nov
    expect(result.getDate()).toBe(1)
  })
})

describe('formatHotelDate', () => {
  it('renders dates as "D MMM, Ddd"', () => {
    // 5 Oct 2024 is a Saturday in reality, but we only care about the format
    // produced from the Date's own getDay()/getMonth()/getDate() values.
    const date = new Date(2024, 9, 7) // Monday 7 Oct 2024
    expect(formatHotelDate(date)).toBe('7 Oct, Mon')
  })

  it('formats a different month/weekday combination', () => {
    const date = new Date(2024, 9, 8) // Tuesday 8 Oct 2024
    expect(formatHotelDate(date)).toBe('8 Oct, Tue')
  })
})

describe('correctCheckOut', () => {
  it('returns checkIn + 1 day when checkOut is before checkIn', () => {
    const checkIn = new Date(2024, 9, 10)
    const checkOut = new Date(2024, 9, 8)
    const result = correctCheckOut(checkIn, checkOut)
    expect(result.getDate()).toBe(11)
  })

  it('returns checkIn + 1 day when checkOut equals checkIn', () => {
    const checkIn = new Date(2024, 9, 10)
    const checkOut = new Date(2024, 9, 10)
    const result = correctCheckOut(checkIn, checkOut)
    expect(result.getDate()).toBe(11)
  })

  it('returns checkOut unchanged when it is already after checkIn', () => {
    const checkIn = new Date(2024, 9, 10)
    const checkOut = new Date(2024, 9, 15)
    const result = correctCheckOut(checkIn, checkOut)
    expect(result.getTime()).toBe(checkOut.getTime())
  })
})
