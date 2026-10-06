import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { BusSeatMap, Seat, SeatDeckName } from '../types'

export interface SeatMapProps {
  seatMap: BusSeatMap
  selectedSeatIds: string[]
  onSelectSeat: (seatId: string) => void
  womenBookingEnabled: boolean
  /** Parent-supplied feedback (e.g. the 6-seat-limit message) to display without SeatMap owning any limit logic itself. */
  limitMessage: string | null
}

type SeatState = 'available' | 'booked' | 'women-only' | 'selected'

const WOMEN_ONLY_TOOLTIP_TEXT = "Women-only seat. Turn on 'Booking for women' to select."

function seatState(seat: Seat, selectedSeatIds: string[], bookedSet: Set<string>): SeatState {
  if (bookedSet.has(seat.id)) return 'booked'
  if (selectedSeatIds.includes(seat.id)) return 'selected'
  if (seat.womenOnly) return 'women-only'
  return 'available'
}

/**
 * Renders a single bus's seat layout as a grid of labelled, keyboard
 * navigable seat buttons. Both decks are always rendered together — so a
 * selection spanning lower and upper berths (e.g. one restored from the
 * `seats` URL param) is always visible at once — and the Lower/Upper tabs
 * shown when the seat map has an upper deck are a cosmetic highlight only;
 * they never unmount either deck's seats. Selection itself is fully
 * controlled via props: this component never owns the selected-seat list
 * or the 6-seat cap, both of which live in the parent (see
 * useSeatSelection / lib/seatSelection.ts).
 */
function SeatMap({ seatMap, selectedSeatIds, onSelectSeat, womenBookingEnabled, limitMessage }: SeatMapProps) {
  const lowerSeats = seatMap.decks.lower
  const upperSeats = seatMap.decks.upper ?? []
  const hasUpperDeck = upperSeats.length > 0
  const combinedSeats: Seat[] = [...lowerSeats, ...upperSeats]

  const [activeDeck, setActiveDeck] = useState<SeatDeckName>('lower')
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [tooltipSeatId, setTooltipSeatId] = useState<string | null>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const bookedSet = new Set(seatMap.booked)

  const requiresTooltip = (seat: Seat) =>
    seat.womenOnly && !womenBookingEnabled && !selectedSeatIds.includes(seat.id)

  const moveFocus = (nextIndex: number) => {
    const clamped = Math.max(0, Math.min(combinedSeats.length - 1, nextIndex))
    setFocusedIndex(clamped)
    itemRefs.current[clamped]?.focus()
  }

  const handleSelect = (seat: Seat) => {
    if (bookedSet.has(seat.id)) return
    if (requiresTooltip(seat)) {
      setTooltipSeatId(seat.id)
      return
    }
    setTooltipSeatId(null)
    onSelectSeat(seat.id)
  }

  const handleFocus = (seat: Seat, index: number) => {
    setFocusedIndex(index)
    setTooltipSeatId(requiresTooltip(seat) ? seat.id : null)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, seat: Seat, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      moveFocus(index + 1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      moveFocus(index - 1)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect(seat)
    }
  }

  const handleDeckChange = (deck: SeatDeckName) => {
    setActiveDeck(deck)
    setTooltipSeatId(null)
  }

  const renderSeat = (seat: Seat, index: number) => {
    const state = seatState(seat, selectedSeatIds, bookedSet)
    const isSelected = state === 'selected'
    const isBooked = state === 'booked'
    const showTooltip = tooltipSeatId === seat.id
    const tooltipId = showTooltip ? `seat-tooltip-${seat.id}` : undefined
    return (
      <div key={seat.id} className="seat-map-seat-wrap">
        <button
          type="button"
          ref={(el) => {
            itemRefs.current[index] = el
          }}
          className={`seat-map-seat seat-map-seat-${state}`}
          aria-label={`Seat ${seat.id}, ${seat.deck} deck, ${state}`}
          aria-pressed={isSelected}
          aria-describedby={tooltipId}
          disabled={isBooked}
          tabIndex={index === focusedIndex ? 0 : -1}
          onClick={() => handleSelect(seat)}
          onFocus={() => handleFocus(seat, index)}
          onKeyDown={(e) => handleKeyDown(e, seat, index)}
        >
          {seat.label}
        </button>
        {showTooltip && (
          <span role="tooltip" id={tooltipId} className="seat-map-tooltip">
            {WOMEN_ONLY_TOOLTIP_TEXT}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="seat-map">
      {hasUpperDeck && (
        <div className="seat-map-deck-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeDeck === 'lower'}
            className={`seat-map-deck-tab${activeDeck === 'lower' ? ' active' : ''}`}
            onClick={() => handleDeckChange('lower')}
          >
            Lower
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeDeck === 'upper'}
            className={`seat-map-deck-tab${activeDeck === 'upper' ? ' active' : ''}`}
            onClick={() => handleDeckChange('upper')}
          >
            Upper
          </button>
        </div>
      )}

      {limitMessage && (
        <p role="alert" className="seat-map-limit-message">
          {limitMessage}
        </p>
      )}

      <div className="seat-map-grid" data-mode={seatMap.mode} data-deck="lower">
        {lowerSeats.map((seat, index) => renderSeat(seat, index))}
      </div>

      {hasUpperDeck && (
        <div className="seat-map-grid" data-mode={seatMap.mode} data-deck="upper">
          {upperSeats.map((seat, index) => renderSeat(seat, lowerSeats.length + index))}
        </div>
      )}

      <ul className="seat-legend">
        <li className="seat-legend-item">
          <span className="seat-swatch seat-swatch-available" aria-hidden="true" /> Available
        </li>
        <li className="seat-legend-item">
          <span className="seat-swatch seat-swatch-booked" aria-hidden="true" /> Booked
        </li>
        <li className="seat-legend-item">
          <span className="seat-swatch seat-swatch-women-only" aria-hidden="true" /> Women-only
        </li>
        <li className="seat-legend-item">
          <span className="seat-swatch seat-swatch-selected" aria-hidden="true" /> Selected
        </li>
      </ul>
    </div>
  )
}

export default SeatMap
