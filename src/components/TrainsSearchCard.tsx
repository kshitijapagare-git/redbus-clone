import { useState } from 'react'
import CityAutocomplete from './CityAutocomplete'
import { addDays } from '../lib/hotelDates'
import { toDateKey } from '../lib/recentSearches'
import { formatTrainDate } from '../lib/trainDates'
import { buildTrainSearchUrl } from '../lib/trainSearchUrl'
import { cities } from '../data'
import type { City } from '../types'

interface TrainSearchErrors {
  from?: string
  to?: string
}

function TrainsSearchCard() {
  const [today] = useState(() => new Date())
  const [dayOffset, setDayOffset] = useState<0 | 1 | 2>(0)
  const [fromStationId, setFromStationId] = useState<City['id'] | null>(null)
  const [toStationId, setToStationId] = useState<City['id'] | null>(null)
  const [freeCancellation, setFreeCancellation] = useState(false)
  const [errors, setErrors] = useState<TrainSearchErrors>({})

  const date = addDays(today, dayOffset)

  const computeErrors = (from: City['id'] | null, to: City['id'] | null): TrainSearchErrors => {
    const nextErrors: TrainSearchErrors = {}
    if (from === null) nextErrors.from = 'Please select a departure station'
    if (to === null) nextErrors.to = 'Please select a destination station'
    if (from !== null && to !== null && from === to) {
      nextErrors.from = 'From and To stations must be different'
      nextErrors.to = 'From and To stations must be different'
    }
    return nextErrors
  }

  const handleToggleFreeCancellation = () => {
    setFreeCancellation((v) => !v)
  }

  const handleSearch = () => {
    const nextErrors = computeErrors(fromStationId, toStationId)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      window.location.href = buildTrainSearchUrl(
        fromStationId as City['id'],
        toStationId as City['id'],
        toDateKey(date),
        freeCancellation,
      )
    }
  }

  return (
    <div className="search-card train-search-card">
      <div className="search-row">
        <div className="search-fields train-search-fields">
          <div className="field combobox-field">
            <span className="field-icon">🚆</span>
            <div className="combobox-field-inner">
              <CityAutocomplete
                id="from-station"
                label="From"
                cities={cities}
                value={fromStationId}
                onChange={setFromStationId}
              />
              {errors.from && <span className="field-error">{errors.from}</span>}
            </div>
          </div>
          <div className="field combobox-field">
            <span className="field-icon">🚆</span>
            <div className="combobox-field-inner">
              <CityAutocomplete
                id="to-station"
                label="To"
                cities={cities}
                value={toStationId}
                onChange={setToStationId}
              />
              {errors.to && <span className="field-error">{errors.to}</span>}
            </div>
          </div>
          <div className="field date-field">
            <span className="field-icon">📅</span>
            <div className="date-text">
              <small>Date of Journey</small>
              <strong>{formatTrainDate(date)}</strong>
            </div>
            <button
              type="button"
              className={`chip ${dayOffset === 0 ? 'chip-active' : ''}`}
              onClick={() => setDayOffset(0)}
            >
              Today
            </button>
            <button
              type="button"
              className={`chip ${dayOffset === 1 ? 'chip-active' : ''}`}
              onClick={() => setDayOffset(1)}
            >
              Tomorrow
            </button>
            <button
              type="button"
              className={`chip ${dayOffset === 2 ? 'chip-active' : ''}`}
              onClick={() => setDayOffset(2)}
            >
              Day After
            </button>
          </div>
        </div>
        <div className="women-box train-free-cancellation-box">
          <span className="women-icon">✅</span>
          <div>
            <div>Free Cancellation</div>
            <small>₹0 cancellation fee</small>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={freeCancellation}
            aria-label="Free Cancellation"
            className={`toggle ${freeCancellation ? 'on' : ''}`}
            onClick={handleToggleFreeCancellation}
          />
        </div>
      </div>
      <button type="button" className="search-btn" onClick={handleSearch}>
        ⌕ Search Trains
      </button>
    </div>
  )
}

export default TrainsSearchCard
