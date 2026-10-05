import { useState } from 'react'
import CityAutocomplete from './CityAutocomplete'
import RecentSearches from './RecentSearches'
import { useRecentSearches } from '../hooks/useRecentSearches'
import { isPastDate, toDateKey } from '../lib/recentSearches'
import { cities } from '../data'
import type { City, RecentSearch } from '../types'

const formatDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-US', { month: 'short' })}, ${d.getFullYear()}`

interface SearchErrors {
  from?: string
  to?: string
}

function SearchCard() {
  const [today] = useState(() => new Date())
  const [dayOffset, setDayOffset] = useState(0)
  const [forWomen, setForWomen] = useState(false)
  const [fromCityId, setFromCityId] = useState<City['id'] | null>(null)
  const [toCityId, setToCityId] = useState<City['id'] | null>(null)
  const [errors, setErrors] = useState<SearchErrors>({})
  const { searches, available, save, remove, clearAll } = useRecentSearches(cities)

  const date = new Date(today)
  date.setDate(today.getDate() + dayOffset)

  const computeErrors = (from: City['id'] | null, to: City['id'] | null): SearchErrors => {
    const nextErrors: SearchErrors = {}
    if (from === null) nextErrors.from = 'Please select a departure city'
    if (to === null) nextErrors.to = 'Please select a destination city'
    if (from !== null && to !== null && from === to) {
      nextErrors.from = 'From and To cities must be different'
      nextErrors.to = 'From and To cities must be different'
    }
    return nextErrors
  }

  const validate = () => {
    const nextErrors = computeErrors(fromCityId, toCityId)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      save({ fromCityId: fromCityId as City['id'], toCityId: toCityId as City['id'], date: toDateKey(date) })
    }
    return Object.keys(nextErrors).length === 0
  }

  const handleSwap = () => {
    const nextFrom = toCityId
    const nextTo = fromCityId
    setFromCityId(nextFrom)
    setToCityId(nextTo)
    if (Object.keys(errors).length > 0) {
      setErrors(computeErrors(nextFrom, nextTo))
    }
  }

  const handleSelectRecent = (search: RecentSearch) => {
    setFromCityId(search.fromCityId)
    setToCityId(search.toCityId)
    setErrors(computeErrors(search.fromCityId, search.toCityId))

    if (isPastDate(search.date, today)) {
      setDayOffset(0)
      return
    }

    const todayKey = toDateKey(today)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const tomorrowKey = toDateKey(tomorrow)

    if (search.date === todayKey) {
      setDayOffset(0)
    } else if (search.date === tomorrowKey) {
      setDayOffset(1)
    } else {
      // Future date beyond tomorrow: the UI only supports today/tomorrow chips,
      // so clamp to the closest supported value.
      setDayOffset(1)
    }
  }

  return (
    <>
    <div className="search-card">
      <div className="search-row">
        <div className="search-fields">
          <div className="field combobox-field">
            <span className="field-icon">🚌</span>
            <div className="combobox-field-inner">
              <CityAutocomplete id="from-city" label="From" cities={cities} value={fromCityId} onChange={setFromCityId} />
              {errors.from && <span className="field-error">{errors.from}</span>}
            </div>
          </div>
          <button type="button" className="swap-btn" aria-label="Swap cities" onClick={handleSwap}>
            ⇄
          </button>
          <div className="field combobox-field">
            <span className="field-icon">🚌</span>
            <div className="combobox-field-inner">
              <CityAutocomplete id="to-city" label="To" cities={cities} value={toCityId} onChange={setToCityId} />
              {errors.to && <span className="field-error">{errors.to}</span>}
            </div>
          </div>
          <div className="field date-field">
            <span className="field-icon">📅</span>
            <div className="date-text">
              <small>Date of Journey</small>
              <strong>{formatDate(date)}</strong>
              <em>{dayOffset === 0 ? '(Today)' : '(Tomorrow)'}</em>
            </div>
            <button type="button" className={`chip ${dayOffset === 0 ? 'chip-active' : ''}`} onClick={() => setDayOffset(0)}>
              Today
            </button>
            <button type="button" className={`chip ${dayOffset === 1 ? 'chip-active' : ''}`} onClick={() => setDayOffset(1)}>
              Tomorrow
            </button>
          </div>
        </div>
        <div className="women-box">
          <span className="women-icon">👩</span>
          <div>
            <div>Booking for women</div>
            <a href="#">Know more</a>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={forWomen}
            aria-label="Booking for women"
            className={`toggle ${forWomen ? 'on' : ''}`}
            onClick={() => setForWomen((v) => !v)}
          />
        </div>
      </div>
      <button type="button" className="search-btn" onClick={validate}>⌕ Search buses</button>
    </div>
    {available && searches.length > 0 && (
      <RecentSearches
        searches={searches}
        cities={cities}
        today={today}
        onSelect={handleSelectRecent}
        onRemove={remove}
        onClearAll={clearAll}
      />
    )}
    </>
  )
}

export default SearchCard
