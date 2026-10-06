import { useCallback, useEffect, useState } from 'react'
import type { BusSeatMap } from '../types'
import {
  SEATS_PARAM,
  buildSeatsQueryValue,
  parseSelectedSeatIds,
  sanitizeSeatSelection,
  toggleSeatSelection,
} from '../lib/seatSelection'

export interface UseSeatSelectionResult {
  selectedSeatIds: string[]
  toggleSeat: (seatId: string) => void
  limitMessage: string | null
}

const SEAT_LIMIT_MESSAGE = 'You can select up to 6 seats'

function readSanitizedSeatIds(seatMap: BusSeatMap): string[] {
  return sanitizeSeatSelection(parseSelectedSeatIds(window.location.search), seatMap)
}

function writeSeatIds(ids: string[]): void {
  const params = new URLSearchParams(window.location.search)
  const value = buildSeatsQueryValue(ids)
  if (value) {
    params.set(SEATS_PARAM, value)
  } else {
    params.delete(SEATS_PARAM)
  }
  const query = params.toString()
  const newSearch = query ? `?${query}` : ''
  const newUrl = `${window.location.pathname}${newSearch}${window.location.hash}`
  window.history.replaceState(window.history.state, '', newUrl)
  // There is no router in this app; a manual popstate dispatch nudges any
  // other mounted instance (and this one's own popstate listener) to re-read
  // window.location.search, mirroring useBoardingPointSelection's
  // writeBoardingPointId convention.
  window.dispatchEvent(new PopStateEvent('popstate'))
}

/**
 * Owns the `seats` URL param for a single bus's seat-selection page. On
 * mount (and whenever the bus/seat map changes), the current `seats` param
 * is sanitized against `seatMap` — any booked or nonexistent id is dropped
 * silently and the corrected list is written straight back to the URL.
 * `toggleSeat` enforces the 6-seat cap via lib/seatSelection's
 * `toggleSeatSelection`, surfacing `limitMessage` instead of adding a 7th
 * seat, and clears it again on the next successful toggle.
 */
export function useSeatSelection(busId: number, seatMap: BusSeatMap): UseSeatSelectionResult {
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>(() => readSanitizedSeatIds(seatMap))
  const [limitMessage, setLimitMessage] = useState<string | null>(null)

  useEffect(() => {
    const parsed = parseSelectedSeatIds(window.location.search)
    const sanitized = sanitizeSeatSelection(parsed, seatMap)
    setSelectedSeatIds(sanitized)
    const changed = sanitized.length !== parsed.length || sanitized.some((id, i) => id !== parsed[i])
    if (changed) {
      writeSeatIds(sanitized)
    }
  }, [busId, seatMap])

  useEffect(() => {
    const handlePopState = () => {
      setSelectedSeatIds(readSanitizedSeatIds(seatMap))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [seatMap])

  const toggleSeat = useCallback(
    (seatId: string) => {
      const result = toggleSeatSelection(selectedSeatIds, seatId, seatMap)
      if (result.limitExceeded) {
        setLimitMessage(SEAT_LIMIT_MESSAGE)
        return
      }
      setLimitMessage(null)
      setSelectedSeatIds(result.ids)
      writeSeatIds(result.ids)
    },
    [selectedSeatIds, seatMap],
  )

  return { selectedSeatIds, toggleSeat, limitMessage }
}

export default useSeatSelection
