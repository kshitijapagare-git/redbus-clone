import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import CityAutocomplete from './CityAutocomplete'
import RoomsGuestsPanel from './RoomsGuestsPanel'
import { addDays, correctCheckOut, formatHotelDate } from '../lib/hotelDates'
import { toDateKey } from '../lib/recentSearches'
import { formatRoomsGuestsSummary } from '../lib/roomsGuests'
import { cities } from '../data'
import type { City } from '../types'

const CITY_INPUT_ID = 'hotel-city'

/** Parses a native `<input type="date">` value ('YYYY-MM-DD') into a local Date, or null if empty/invalid. */
function parseDateInputValue(value: string): Date | null {
  if (!value) return null
  const parts = value.split('-').map(Number)
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null
  const [year, month, day] = parts
  return new Date(year, month - 1, day)
}

function HotelsSearchCard() {
  const [today] = useState(() => new Date())
  const [cityId, setCityId] = useState<City['id'] | null>(null)
  const [cityError, setCityError] = useState<string | undefined>(undefined)
  const [checkIn, setCheckIn] = useState(() => today)
  const [checkOut, setCheckOut] = useState(() => addDays(today, 1))
  const [rooms, setRooms] = useState(1)
  const [adultsPerRoom, setAdultsPerRoom] = useState(2)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const roomsGuestsTriggerRef = useRef<HTMLButtonElement>(null)

  const handleCityChange = (id: City['id'] | null) => {
    setCityId(id)
    if (id !== null) {
      setCityError(undefined)
    }
  }

  const handleCheckInChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newCheckIn = parseDateInputValue(e.target.value)
    if (!newCheckIn) return
    // Past check-in dates are blocked, not just discouraged via `min` — a
    // programmatic or typed value earlier than today is ignored outright.
    if (toDateKey(newCheckIn) < toDateKey(today)) return
    setCheckIn(newCheckIn)
    setCheckOut((prevCheckOut) => correctCheckOut(newCheckIn, prevCheckOut))
  }

  const handleCheckOutChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newCheckOut = parseDateInputValue(e.target.value)
    if (!newCheckOut) return
    // Check-out must land strictly after check-in; anything else is ignored.
    if (toDateKey(newCheckOut) <= toDateKey(checkIn)) return
    setCheckOut(newCheckOut)
  }

  const handleSearch = () => {
    if (cityId === null) {
      setCityError('Please select a city, area or hotel')
      document.getElementById(CITY_INPUT_ID)?.focus()
      return
    }
    setCityError(undefined)
    // Showing hotel results is a separate ticket.
  }

  return (
    <div className="search-card hotel-search-card">
      <div className="search-row">
        <div className="search-fields hotel-search-fields">
          <div className="field combobox-field">
            <span className="field-icon">🏨</span>
            <div className="combobox-field-inner">
              <CityAutocomplete
                id={CITY_INPUT_ID}
                label="City, area or hotel name"
                cities={cities}
                value={cityId}
                onChange={handleCityChange}
              />
              {cityError && <span className="field-error">{cityError}</span>}
            </div>
          </div>
          <div className="field hotel-date-field">
            <span className="field-icon">📅</span>
            <div className="date-text">
              <small>Check in</small>
              <strong>{formatHotelDate(checkIn)}</strong>
            </div>
            <input
              type="date"
              aria-label="Check in"
              className="hotel-date-input"
              value={toDateKey(checkIn)}
              min={toDateKey(today)}
              onChange={handleCheckInChange}
            />
          </div>
          <div className="field hotel-date-field">
            <span className="field-icon">📅</span>
            <div className="date-text">
              <small>Check out</small>
              <strong>{formatHotelDate(checkOut)}</strong>
            </div>
            <input
              type="date"
              aria-label="Check out"
              className="hotel-date-input"
              value={toDateKey(checkOut)}
              min={toDateKey(addDays(checkIn, 1))}
              onChange={handleCheckOutChange}
            />
          </div>
          <div className="field rooms-guests-field">
            <span className="field-icon">🧑‍🤝‍🧑</span>
            <div className="rooms-guests-field-inner">
              <button
                type="button"
                ref={roomsGuestsTriggerRef}
                className="rooms-guests-trigger"
                aria-haspopup="dialog"
                aria-expanded={isPanelOpen}
                onClick={() => setIsPanelOpen((v) => !v)}
              >
                <small>No. of rooms &amp; guests</small>
                <strong>{formatRoomsGuestsSummary(rooms, adultsPerRoom)}</strong>
              </button>
              {isPanelOpen && (
                <RoomsGuestsPanel
                  rooms={rooms}
                  adultsPerRoom={adultsPerRoom}
                  onRoomsChange={setRooms}
                  onAdultsChange={setAdultsPerRoom}
                  onClose={() => setIsPanelOpen(false)}
                  triggerRef={roomsGuestsTriggerRef}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <button type="button" className="search-btn" onClick={handleSearch}>
        ⌕ Search hotels
      </button>
    </div>
  )
}

export default HotelsSearchCard
