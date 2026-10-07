export const GST_RATE = 0.05

export interface FareBreakdown {
  subtotal: number
  gst: number
  total: number
}

/**
 * subtotal = fare * seatCount, gst = GST_RATE * subtotal, total is the
 * rounded (nearest rupee, via Math.round) sum of subtotal and gst.
 */
export function computeFare(fare: number, seatCount: number): FareBreakdown {
  const subtotal = fare * seatCount
  const gst = GST_RATE * subtotal
  const total = Math.round(subtotal + gst)
  return { subtotal, gst, total }
}

export interface FareBreakdownWithDiscount extends FareBreakdown {
  discount: number
}

/**
 * Like computeFare, but applies `discountAmount` to the subtotal before GST
 * is computed: gst = GST_RATE * (subtotal - discountAmount), and
 * total = round(gst + (subtotal - discountAmount)), floored at a minimum of
 * ₹1 so a discount can never drive (or appear to drive) the payable total
 * to zero or below. `subtotal` in the returned breakdown is the undiscounted
 * base-fare subtotal, matching computeFare's meaning of that field.
 */
export function computeFareWithDiscount(
  fare: number,
  seatCount: number,
  discountAmount: number,
): FareBreakdownWithDiscount {
  const subtotal = fare * seatCount
  const discountedSubtotal = subtotal - discountAmount
  const gst = GST_RATE * discountedSubtotal
  const rawTotal = Math.round(gst + discountedSubtotal)
  const total = Math.max(1, rawTotal)
  return { subtotal, discount: discountAmount, gst, total }
}
