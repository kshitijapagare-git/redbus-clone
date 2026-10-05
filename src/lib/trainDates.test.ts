import { describe, expect, it } from 'vitest'
import { formatTrainDate } from './trainDates'

describe('formatTrainDate', () => {
  it('formats a date as DD MMM, YYYY with zero-padded day', () => {
    expect(formatTrainDate(new Date(2026, 9, 7))).toBe('07 Oct, 2026')
  })

  it('zero-pads single-digit days', () => {
    expect(formatTrainDate(new Date(2026, 0, 1))).toBe('01 Jan, 2026')
  })

  it('formats correctly across a month boundary', () => {
    expect(formatTrainDate(new Date(2026, 9, 31))).toBe('31 Oct, 2026')
    expect(formatTrainDate(new Date(2026, 10, 1))).toBe('01 Nov, 2026')
  })
})
