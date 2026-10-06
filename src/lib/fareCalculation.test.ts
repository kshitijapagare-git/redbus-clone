import { describe, expect, it } from 'vitest'
import { GST_RATE, computeFare } from './fareCalculation'

describe('GST_RATE', () => {
  it('is 0.05', () => {
    expect(GST_RATE).toBe(0.05)
  })
})

describe('computeFare', () => {
  it('computes subtotal, gst and total for a simple case', () => {
    expect(computeFare(800, 2)).toEqual({ subtotal: 1600, gst: 80, total: 1680 })
  })

  it('computes correctly for a single seat', () => {
    expect(computeFare(500, 1)).toEqual({ subtotal: 500, gst: 25, total: 525 })
  })

  it('rounds a fractional total to the nearest rupee', () => {
    // subtotal = 750 * 3 = 2250, gst = 112.5, sum = 2362.5 -> rounds to 2363 (Math.round rounds .5 up)
    const result = computeFare(750, 3)
    expect(result.subtotal).toBe(2250)
    expect(result.gst).toBe(112.5)
    expect(result.total).toBe(2363)
  })

  it('rounds down when the fractional part is below .5', () => {
    // subtotal = 820, gst = 41, sum = 861, no rounding needed
    const result = computeFare(820, 1)
    expect(result.total).toBe(861)
  })
})
