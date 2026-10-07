import { describe, expect, it } from 'vitest'
import { computeFare, computeFareWithDiscount } from './fareCalculation'

describe('computeFare', () => {
  it('computes subtotal, gst and rounded total with no discount', () => {
    expect(computeFare(800, 2)).toEqual({ subtotal: 1600, gst: 80, total: 1680 })
  })
})

describe('computeFareWithDiscount', () => {
  it('leaves subtotal unchanged by the discount', () => {
    const result = computeFareWithDiscount(800, 2, 300)
    expect(result.subtotal).toBe(1600)
  })

  it('computes gst on (subtotal - discount)', () => {
    const result = computeFareWithDiscount(800, 2, 300)
    // discounted subtotal = 1300, gst = 5% of 1300 = 65
    expect(result.gst).toBe(65)
    expect(result.discount).toBe(300)
  })

  it('computes total as round(gst + (subtotal - discount))', () => {
    const result = computeFareWithDiscount(800, 2, 300)
    // 1300 + 65 = 1365
    expect(result.total).toBe(1365)
  })

  it('matches computeFare when discount is zero', () => {
    const withDiscount = computeFareWithDiscount(800, 2, 0)
    const plain = computeFare(800, 2)
    expect(withDiscount.subtotal).toBe(plain.subtotal)
    expect(withDiscount.gst).toBe(plain.gst)
    expect(withDiscount.total).toBe(plain.total)
  })

  it('floors the total at ₹1 when the discount would drive it to zero or below', () => {
    const result = computeFareWithDiscount(100, 1, 100)
    expect(result.total).toBe(1)
  })

  it('floors the total at ₹1 when the discount exceeds the subtotal', () => {
    const result = computeFareWithDiscount(100, 1, 5000)
    expect(result.total).toBe(1)
  })
})
