import { computeFare } from '../lib/fareCalculation'
import { sortSeatIds } from '../lib/seatSelection'
import type { BoardingPoint } from '../types'

export interface BookingSummaryPanelProps {
  seatIds: string[]
  boardingPoint: BoardingPoint | null
  droppingPoint: BoardingPoint | null
  fare: number
  onContinue: () => void
}

/**
 * Live fare summary for the seat-selection page: seat numbers, chosen
 * boarding/dropping points, and the subtotal/GST/total breakdown from
 * lib/fareCalculation. Rendered fixed on desktop and as a bottom bar on
 * phones via CSS (`.booking-summary-panel`), not by this component itself.
 * Continue is only enabled once a seat, a boarding point and a dropping
 * point are all chosen.
 */
function BookingSummaryPanel({ seatIds, boardingPoint, droppingPoint, fare, onContinue }: BookingSummaryPanelProps) {
  const orderedSeatIds = sortSeatIds(seatIds)
  const { subtotal, gst, total } = computeFare(fare, seatIds.length)
  const canContinue = seatIds.length > 0 && boardingPoint !== null && droppingPoint !== null

  return (
    <aside className="booking-summary-panel" aria-label="Booking summary">
      <div className="booking-summary-row booking-summary-seats">
        <span className="booking-summary-label">Seats</span>
        <span className="booking-summary-value">
          {orderedSeatIds.length > 0 ? orderedSeatIds.join(', ') : 'None selected'}
        </span>
      </div>
      <div className="booking-summary-row">
        <span className="booking-summary-label">Boarding point</span>
        <span className="booking-summary-value">{boardingPoint ? boardingPoint.name : 'Not selected'}</span>
      </div>
      <div className="booking-summary-row">
        <span className="booking-summary-label">Dropping point</span>
        <span className="booking-summary-value">{droppingPoint ? droppingPoint.name : 'Not selected'}</span>
      </div>
      <div className="booking-summary-row">
        <span className="booking-summary-label">
          Base fare ({fare} × {seatIds.length})
        </span>
        <span className="booking-summary-value">₹{subtotal}</span>
      </div>
      <div className="booking-summary-row">
        <span className="booking-summary-label">GST (5%)</span>
        <span className="booking-summary-value">₹{gst}</span>
      </div>
      <div className="booking-summary-row booking-summary-total">
        <span className="booking-summary-label">Total</span>
        <span className="booking-summary-value" aria-live="polite">
          ₹{total}
        </span>
      </div>
      <button type="button" className="booking-summary-continue-btn" disabled={!canContinue} onClick={onContinue}>
        Continue
      </button>
    </aside>
  )
}

export default BookingSummaryPanel
