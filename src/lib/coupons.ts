import type { Coupon } from '../types'

export interface CouponValidationSuccess {
  valid: true
  discountAmount: number
}

export interface CouponValidationFailure {
  valid: false
  error: string
}

export type CouponValidationResult = CouponValidationSuccess | CouponValidationFailure

/**
 * Validates a coupon code against the given bus. Pure/synchronous: no
 * time-based logic, only the explicit `active`/`allowedBusIds` flags on each
 * Coupon record decide eligibility.
 */
export function validateCoupon(code: string, busId: number, coupons: Coupon[]): CouponValidationResult {
  const normalizedCode = code.trim().toUpperCase()
  const match = coupons.find((c) => c.code === normalizedCode)

  if (!match) {
    return { valid: false, error: 'Invalid coupon code.' }
  }

  if (!match.active) {
    return { valid: false, error: 'This coupon has expired.' }
  }

  if (!match.allowedBusIds.includes(busId)) {
    return { valid: false, error: 'This coupon is not valid for this bus.' }
  }

  return { valid: true, discountAmount: match.discountAmount }
}
