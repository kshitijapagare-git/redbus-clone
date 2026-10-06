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
