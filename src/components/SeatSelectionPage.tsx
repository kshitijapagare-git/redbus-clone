import { useMemo, useState } from 'react'
import BookingSummaryPanel from './BookingSummaryPanel'
import PointPicker from './PointPicker'
import SeatMap from './SeatMap'
import { boardingPoints, buses, busesSeats } from '../data'
import { useBoardingPointSelection } from '../hooks/useBoardingPointSelection'
import { useSeatSelection } from '../hooks/useSeatSelection'
import { bookedSeatIdsForBusAndDate, loadBookings } from '../lib/bookings'
import { resolveSelectedBoardingPoint } from '../lib/boardingPointSelection'
import { navigateTo } from '../lib/route'
import { loadWomenToggle } from '../lib/womenToggle'
import type { BusSeatMap } from '../types'

export interface SeatSelectionPageProps {
  busId: number
}

/** Stable fallback used only when a bus/seat map can't be resolved, so the hooks below always get a real, referentially-stable BusSeatMap to call. */
const EMPTY_SEAT_MAP: BusSeatMap = { mode: 'seater', decks: { lower: [] }, booked: [] }

/**
 * Assembles the full seat-selection experience for a single bus: the seat
 * map (deck tabs, legend, 6-seat cap, women-only rule), boarding/dropping
 * point pickers derived from the bus's own route, and a live booking
 * summary with fare/GST/total. All selection state round-trips through the
 * URL (`seats`/`bp`/`dp`) so a reload restores it, with any invalid seat id
 * silently dropped on the way in.
 */
function SeatSelectionPage({ busId }: SeatSelectionPageProps) {
  const bus = buses.find((b) => b.id === busId)
  const rawSeatMap = busesSeats[busId]
  const date = new URLSearchParams(window.location.search).get('date')

  const seatMap = useMemo(() => {
    const base = rawSeatMap ?? EMPTY_SEAT_MAP
    if (date === null) return base
    const { bookings } = loadBookings()
    const newlyBookedIds = bookedSeatIdsForBusAndDate(bookings, busId, date)
    if (newlyBookedIds.length === 0) return base
    const mergedBooked = Array.from(new Set([...base.booked, ...newlyBookedIds]))
    return { ...base, booked: mergedBooked }
  }, [rawSeatMap, busId, date])

  const [womenBookingEnabled] = useState(() => loadWomenToggle().value)

  const { selectedSeatIds, toggleSeat, limitMessage } = useSeatSelection(busId, seatMap)

  const [fromCityIdRaw, toCityIdRaw] = bus ? bus.routeId.split('-') : [undefined, undefined]
  const fromCityId = fromCityIdRaw !== undefined ? Number(fromCityIdRaw) : null
  const toCityId = toCityIdRaw !== undefined ? Number(toCityIdRaw) : null

  const boardingOptions = boardingPoints.filter((p) => p.cityId === fromCityId)
  const droppingOptions = boardingPoints.filter((p) => p.cityId === toCityId)

  const { rawId: bpRawId } = useBoardingPointSelection('bp')
  const { rawId: dpRawId } = useBoardingPointSelection('dp')

  const boardingPoint = resolveSelectedBoardingPoint(bpRawId, boardingOptions, fromCityId)
  const droppingPoint = resolveSelectedBoardingPoint(dpRawId, droppingOptions, toCityId)

  const canContinue = selectedSeatIds.length > 0 && boardingPoint !== null && droppingPoint !== null

  const handleContinue = () => {
    if (!canContinue || boardingPoint === null || droppingPoint === null) return
    const params = new URLSearchParams()
    params.set('seats', selectedSeatIds.join(','))
    params.set('bp', String(boardingPoint.id))
    params.set('dp', String(droppingPoint.id))
    if (date !== null) {
      params.set('date', date)
    }
    navigateTo(`/search/${busId}/seats/passengers?${params.toString()}`)
  }

  if (!bus || !rawSeatMap) {
    return (
      <main className="seat-selection-page">
        <div className="container">
          <h1>Select your seats</h1>
          <p role="alert">Bus not found.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="seat-selection-page">
      <div className="container seat-selection-page-inner">
        <h1>Select your seats</h1>
        <p className="seat-selection-bus-summary">
          {bus.operatorName} · {bus.busType}
        </p>

        <div className="seat-selection-main">
          <div className="seat-selection-left">
            <SeatMap
              seatMap={seatMap}
              selectedSeatIds={selectedSeatIds}
              onSelectSeat={toggleSeat}
              womenBookingEnabled={womenBookingEnabled}
              limitMessage={limitMessage}
            />

            <div className="seat-selection-points">
              <PointPicker label="Boarding point" paramKey="bp" points={boardingOptions} cityId={fromCityId} />
              <PointPicker label="Dropping point" paramKey="dp" points={droppingOptions} cityId={toCityId} />
            </div>
          </div>

          <BookingSummaryPanel
            seatIds={selectedSeatIds}
            boardingPoint={boardingPoint}
            droppingPoint={droppingPoint}
            fare={bus.fare}
            onContinue={handleContinue}
          />
        </div>
      </div>
    </main>
  )
}



export default SeatSelectionPage
