import type { Coupon } from '../types'

/**
 * Coupon rules for the current sample bus data (ids 1-10, see
 * src/data/buses.ts). Validity/expiry and bus-eligibility are explicit data
 * flags here rather than time-based logic: `active: false` represents an
 * expired/inactive code, and `allowedBusIds` represents eligibility.
 * TRAIN150 (a train-only offer from Offers.tsx) is deliberately absent from
 * this list, so it is correctly treated as an unknown code for any bus.
 */
export const coupons: Coupon[] = [
  {
    code: 'FESTIVE300',
    discountAmount: 300,
    active: true,
    allowedBusIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    code: 'FIRST',
    discountAmount: 250,
    active: true,
    allowedBusIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    code: 'BUS300',
    discountAmount: 300,
    active: true,
    allowedBusIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    code: 'PRIMODAY',
    discountAmount: 200,
    active: true,
    allowedBusIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
]
