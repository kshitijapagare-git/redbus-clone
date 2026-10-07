import { describe, expect, it } from 'vitest'
import { validateCoupon } from './coupons'
import type { Coupon } from '../types'

const testCoupons: Coupon[] = [
  { code: 'FESTIVE300', discountAmount: 300, active: true, allowedBusIds: [1, 2, 3] },
  { code: 'EXPIRED10', discountAmount: 100, active: false, allowedBusIds: [1, 2, 3] },
  { code: 'BUS300', discountAmount: 300, active: true, allowedBusIds: [5] },
]

describe('validateCoupon', () => {
  it('returns the discount for a valid code on an eligible bus', () => {
    expect(validateCoupon('FESTIVE300', 1, testCoupons)).toEqual({ valid: true, discountAmount: 300 })
  })

  it('returns an error for an unknown code', () => {
    const result = validateCoupon('TRAIN150', 1, testCoupons)
    expect(result.valid).toBe(false)
    expect((result as { error: string }).error).toBeTruthy()
  })

  it('returns an error for an inactive/expired code', () => {
    const result = validateCoupon('EXPIRED10', 1, testCoupons)
    expect(result.valid).toBe(false)
  })

  it('returns an error for a code not eligible for the given bus', () => {
    const result = validateCoupon('BUS300', 1, testCoupons)
    expect(result.valid).toBe(false)
  })

  it('is case-insensitive on the code', () => {
    expect(validateCoupon('festive300', 1, testCoupons)).toEqual({ valid: true, discountAmount: 300 })
  })
})
