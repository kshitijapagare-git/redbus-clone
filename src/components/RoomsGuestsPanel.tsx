import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import {
  MAX_ADULTS_PER_ROOM,
  MAX_ROOMS,
  MIN_ADULTS_PER_ROOM,
  MIN_ROOMS,
  clampAdultsPerRoom,
  clampRooms,
} from '../lib/roomsGuests'

export interface RoomsGuestsPanelProps {
  rooms: number
  adultsPerRoom: number
  onRoomsChange: (n: number) => void
  onAdultsChange: (n: number) => void
  onClose: () => void
  triggerRef: RefObject<HTMLElement | null>
}

function RoomsGuestsPanel({
  rooms,
  adultsPerRoom,
  onRoomsChange,
  onAdultsChange,
  onClose,
  triggerRef,
}: RoomsGuestsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Closes on Escape or an outside click, restoring focus to the trigger
  // element in both cases — mirrors the open/close convention used by
  // WomenInfoDialog.tsx, but here the panel itself owns focus restoration
  // since the trigger is passed in as a ref rather than managed by the caller.
  useEffect(() => {
    const closeAndRestoreFocus = () => {
      onClose()
      triggerRef.current?.focus()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeAndRestoreFocus()
      }
    }

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node
      const panel = panelRef.current
      const trigger = triggerRef.current
      if (panel && !panel.contains(target) && trigger !== target && !trigger?.contains(target)) {
        closeAndRestoreFocus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [onClose, triggerRef])

  const decrementRooms = () => onRoomsChange(clampRooms(rooms - 1))
  const incrementRooms = () => onRoomsChange(clampRooms(rooms + 1))
  const decrementAdults = () => onAdultsChange(clampAdultsPerRoom(adultsPerRoom - 1))
  const incrementAdults = () => onAdultsChange(clampAdultsPerRoom(adultsPerRoom + 1))

  return (
    <div role="dialog" aria-label="Rooms and guests" className="rooms-guests-panel" ref={panelRef}>
      <div className="rooms-guests-row">
        <span>Rooms</span>
        <div className="rooms-guests-stepper">
          <button
            type="button"
            aria-label="Decrease rooms"
            className="stepper-btn"
            disabled={rooms <= MIN_ROOMS}
            onClick={decrementRooms}
          >
            −
          </button>
          <span className="rooms-guests-count">{rooms}</span>
          <button
            type="button"
            aria-label="Increase rooms"
            className="stepper-btn"
            disabled={rooms >= MAX_ROOMS}
            onClick={incrementRooms}
          >
            +
          </button>
        </div>
      </div>
      <div className="rooms-guests-row">
        <span>Adults</span>
        <div className="rooms-guests-stepper">
          <button
            type="button"
            aria-label="Decrease adults"
            className="stepper-btn"
            disabled={adultsPerRoom <= MIN_ADULTS_PER_ROOM}
            onClick={decrementAdults}
          >
            −
          </button>
          <span className="rooms-guests-count">{adultsPerRoom}</span>
          <button
            type="button"
            aria-label="Increase adults"
            className="stepper-btn"
            disabled={adultsPerRoom >= MAX_ADULTS_PER_ROOM}
            onClick={incrementAdults}
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoomsGuestsPanel
